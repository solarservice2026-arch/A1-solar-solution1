import { createClient } from "@supabase/supabase-js";
import type { AppRole } from "@a1/validation";
import { env } from "../env.js";
import type { AuthContext, AuthProvider } from "./types.js";

export class SupabaseAuthProvider implements AuthProvider {
  async resolve(accessToken: string): Promise<AuthContext | null> {
    try {
      const url = env.SUPABASE_URL;
      const anon = env.SUPABASE_ANON_KEY;
      if (!url || !anon) return null;
      let issuer = "";
      try {
        issuer = String(
          JSON.parse(Buffer.from(accessToken.split(".")[1] ?? "", "base64url").toString("utf8")).iss ?? "",
        );
      } catch {
        return null;
      }
      if (issuer !== `${url}/auth/v1`) return null;
      const authResponse = await fetch(`${url}/auth/v1/user`, {
        headers: { apikey: anon, Authorization: `Bearer ${accessToken}` },
      });
      if (!authResponse.ok) return null;
      const user = (await authResponse.json()) as { id?: string; email?: string };
      if (!user.id || !user.email) return null;
      const userClient = createClient(url, anon, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { Authorization: `Bearer ${accessToken}` } },
      });
      const [profileResult, contextResult] = await Promise.all([
        userClient.from("profiles").select("active").eq("id", user.id).single(),
        userClient.rpc("current_auth_context"),
      ]);
      if (profileResult.error || contextResult.error) return null;
      const profile = profileResult.data;
      if (!profile?.active)
        return { userId: user.id, email: user.email, active: false, roles: [], permissions: [] };
      const context = contextResult.data as { roles?: AppRole[]; permissions?: string[] } | null;
      return {
        userId: user.id,
        email: user.email,
        active: true,
        roles: Array.isArray(context?.roles) ? context.roles : [],
        permissions: Array.isArray(context?.permissions) ? context.permissions : [],
      };
    } catch {
      return null;
    }
  }
}
