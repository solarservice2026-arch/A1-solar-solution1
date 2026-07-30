import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const api = process.env.ROLE_AUDIT_API_URL ?? "http://127.0.0.1:5000/api/v1";
const credentials = JSON.parse(
  fs.readFileSync(".auth/e2e-credentials.json", "utf8"),
);
const admin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const auth = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const { data: sessionData, error: loginError } =
  await auth.auth.signInWithPassword(credentials.INSTALLER);
if (loginError || !sessionData.session) throw new Error("Installer login failed");
const token = sessionData.session.access_token;
const installerId = sessionData.user.id;
const superAuth = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const { data: superSession, error: superLoginError } =
  await superAuth.auth.signInWithPassword(credentials.SUPER_ADMIN);
if (superLoginError || !superSession.session)
  throw new Error("Super Admin login failed");
const superHeaders = {
  authorization: `Bearer ${superSession.session.access_token}`,
  "content-type": "application/json",
};
const installersResponse = await fetch(`${api}/projects/installers`, {
  headers: superHeaders,
});
const installersBody = await installersResponse.json();
const installerLookupPassed = (installersBody.data ?? []).some(
  (item) => item.id === installerId,
);

const { data: project } = await admin
  .from("projects")
  .select("id,stage,progress")
  .limit(1)
  .maybeSingle();

let assignmentPassed = true;
if (project) {
  const assignment = await fetch(`${api}/projects/${project.id}/assignment`, {
    method: "PATCH",
    headers: superHeaders,
    body: JSON.stringify({ assignedTo: installerId }),
  });
  assignmentPassed = assignment.ok;
}

const headers = {
  authorization: `Bearer ${token}`,
  "content-type": "application/json",
};
const projectsResponse = await fetch(`${api}/projects`, { headers });
const projectsBody = await projectsResponse.json();
const projects = projectsBody.data ?? [];
const isolationPassed = projects.every(
  (item) => item.assigned_to === installerId,
);

let updatePassed = true;
if (project) {
  const update = await fetch(`${api}/projects/${project.id}/progress`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      stage: project.stage,
      progress: Number(project.progress ?? 0),
    }),
  });
  updatePassed = update.ok;
}

const deniedPaths = ["/customers", "/invoices", "/staff", "/roles"];
const deniedResults = await Promise.all(
  deniedPaths.map(async (path) => {
    const response = await fetch(`${api}${path}`, { headers });
    return response.status === 403;
  }),
);
const passed =
  projectsResponse.ok &&
  installerLookupPassed &&
  assignmentPassed &&
  isolationPassed &&
  updatePassed &&
  deniedResults.every(Boolean);

console.log("Installer login: passed");
console.log(
  `Installer assignment lookup: ${installerLookupPassed ? "passed" : "failed"}`,
);
console.log(`Installer assignment: ${assignmentPassed ? "passed" : "failed"}`);
console.log(`Assigned project isolation: ${isolationPassed ? "passed" : "failed"}`);
console.log(`Progress update: ${updatePassed ? "passed" : "failed"}`);
console.log(
  `Unauthorized business/admin access: ${deniedResults.every(Boolean) ? "blocked" : "failed"}`,
);
console.log(`Installer role verification: ${passed ? "passed" : "failed"}`);

if (!passed) process.exitCode = 1;
