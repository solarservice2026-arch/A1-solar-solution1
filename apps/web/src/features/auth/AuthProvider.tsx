import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { apiBaseUrl } from "../../lib/api-base";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";

export interface CurrentUser { id:string; email:string; fullName:string; active:boolean; roles:string[]; permissions:string[] }
interface AuthValue {
  session:Session|null; user:CurrentUser|null; loading:boolean; error:string|null;
  signIn(email:string,password:string):Promise<void>; signOut():Promise<void>; refreshProfile():Promise<void>;
}
const AuthContext=createContext<AuthValue|null>(null);
let currentProfileRequest:{token:string;promise:Promise<CurrentUser>}|null=null;
async function fetchCurrent(session:Session):Promise<CurrentUser>{
 if(currentProfileRequest?.token===session.access_token)return currentProfileRequest.promise;
 const promise=(async()=>{
  const response=await fetch(`${apiBaseUrl}/auth/me`,{credentials:"include",headers:{"Content-Type":"application/json",Authorization:`Bearer ${session.access_token}`}});
  const body=await response.json() as {success:boolean;message:string;data?:{user:{id:string;email:string;full_name:string;active:boolean};roles:string[];permissions:string[]}};
  if(!response.ok||!body.data) throw new Error(body.message);
  return {id:body.data.user.id,email:body.data.user.email,fullName:body.data.user.full_name,active:body.data.user.active,roles:body.data.roles,permissions:body.data.permissions};
 })();
 currentProfileRequest={token:session.access_token,promise};
 try{return await promise}finally{if(currentProfileRequest?.promise===promise)currentProfileRequest=null}
}
export function AuthProvider({children}:{children:React.ReactNode}){
 const [session,setSession]=useState<Session|null>(null),[user,setUser]=useState<CurrentUser|null>(null);
 const [loading,setLoading]=useState(true),[error,setError]=useState<string|null>(null);
 const load=useCallback(async(current:Session|null)=>{setSession(current);setError(null);if(!current){setUser(null);setLoading(false);return}try{setUser(await fetchCurrent(current))}catch(e){setUser(null);setError(e instanceof Error?e.message:"Unable to restore session")}finally{setLoading(false)}},[]);
 useEffect(()=>{if(!isSupabaseConfigured){setLoading(false);return}void supabase.auth.getSession().then(({data})=>load(data.session));const {data}=supabase.auth.onAuthStateChange((_event,next)=>{void load(next)});return()=>data.subscription.unsubscribe()},[load]);
 const value=useMemo<AuthValue>(()=>({session,user,loading,error,refreshProfile:async()=>{if(session)await load(session)},signIn:async(email,password)=>{if(!isSupabaseConfigured)throw new Error("Supabase is not configured");setLoading(true);const {data,error:authError}=await supabase.auth.signInWithPassword({email,password});if(authError){setLoading(false);throw authError}await load(data.session)},signOut:async()=>{await supabase.auth.signOut();setSession(null);setUser(null)}}),[session,user,loading,error,load]);
 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export function useAuth(){const value=useContext(AuthContext);if(!value)throw new Error("useAuth must be inside AuthProvider");return value}
