import type { AppRole } from "@a1/validation";
export interface AuthContext {
  userId: string;
  email: string;
  active: boolean;
  roles: AppRole[];
  permissions: string[];
}
declare global {
  namespace Express { interface Request { auth?: AuthContext } }
}
export interface AuthProvider {
  resolve(accessToken: string): Promise<AuthContext | null>;
}
