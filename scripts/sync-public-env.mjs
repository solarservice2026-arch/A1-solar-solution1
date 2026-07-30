import { readFile,writeFile } from "node:fs/promises";
const parse=(text)=>Object.fromEntries(text.split(/\r?\n/).map(line=>line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)).filter(Boolean).map(match=>[match[1],match[2]]));
const root=parse(await readFile(".env","utf8"));
if(!root.SUPABASE_URL||!root.SUPABASE_ANON_KEY)throw new Error("Missing public Supabase backend values");
const output=[
  "VITE_API_URL=http://localhost:5000/api/v1",
  `VITE_SUPABASE_URL=${root.SUPABASE_URL}`,
  `VITE_SUPABASE_ANON_KEY=${root.SUPABASE_ANON_KEY}`,
  ""
].join("\n");
await writeFile("apps/web/.env.local",output,"utf8");
console.log("Frontend public Supabase environment synchronized.");
