import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";
import { mkdir,readFile,rm,writeFile } from "node:fs/promises";
const credentialPath=".auth/e2e-credentials.json";
const required=["SUPABASE_URL","SUPABASE_SERVICE_ROLE_KEY"];
for(const key of required)if(!process.env[key])throw new Error(`Missing required environment variable: ${key}`);
const admin=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const specs=[
 ["SUPER_ADMIN","super_admin"],["ADMIN","admin"],["MANAGER","manager"],["SALES","sales_executive"],["INSTALLER","installation_staff"],
 ["TECHNICIAN","service_technician"],["ACCOUNTANT","accountant"],["CUSTOMER_A","customer"],["CUSTOMER_B","customer"],["DISABLED",null],["NO_ROLE",null]
];
const command=process.argv[2];
if(command==="seed"){
 let stored={};try{stored=JSON.parse(await readFile(credentialPath,"utf8"))}catch{}
 for(const [label,roleName] of specs){
  const email=process.env[`E2E_${label}_EMAIL`]??stored[label]?.email??`a1-e2e-${label.toLowerCase().replaceAll("_","-")}@example.test`;
  const password=process.env[`E2E_${label}_PASSWORD`]??stored[label]?.password??`${crypto.randomBytes(18).toString("base64url")}Aa1`;
  stored[label]={email,password};
  const {data,error}=await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{full_name:`E2E ${label}`,e2e_test_user:true}});
  if(error&&!error.message.toLowerCase().includes("already"))throw error;
  const user=data.user??(await admin.auth.admin.listUsers()).data.users.find(user=>user.email===email);
  if(!user)throw new Error(`Unable to resolve E2E user ${label}`);
  const {error:updateError}=await admin.auth.admin.updateUserById(user.id,{
   password,
   email_confirm:true,
   user_metadata:{...(user.user_metadata??{}),full_name:`E2E ${label}`,e2e_test_user:true}
  });
  if(updateError)throw updateError;
  await admin.from("profiles").upsert({id:user.id,full_name:`E2E ${label}`,active:label!=="DISABLED"});
  if(roleName){const {data:role}=await admin.from("roles").select("id").eq("name",roleName).single();if(!role)throw new Error(`Missing seeded role ${roleName}`);await admin.from("user_roles").upsert({user_id:user.id,role_id:role.id})}
 }
 await mkdir(".auth",{recursive:true});await writeFile(credentialPath,JSON.stringify(stored),"utf8");
 const readable=[
  "A1 SOLAR TEST USER CREDENTIALS",
  "Test project only. Do not commit or share publicly.",
  "",
  ...specs.filter(([,role])=>role).flatMap(([label,role])=>[
   `${label} (${role})`,
   `Email: ${stored[label].email}`,
   `Password: ${stored[label].password}`,
   ""
  ])
 ];
 await writeFile(".auth/TEST_USER_CREDENTIALS.txt",readable.join("\r\n"),"utf8");
 console.log(`Provisioned ${specs.length} tagged E2E users.`);
}else if(command==="cleanup"){
 const {data}=await admin.auth.admin.listUsers({page:1,perPage:1000});const targets=data.users.filter(user=>user.user_metadata?.e2e_test_user===true);
 for(const user of targets)await admin.auth.admin.deleteUser(user.id);await rm(credentialPath,{force:true});console.log(`Deleted ${targets.length} tagged E2E users.`);
}else throw new Error("Use seed or cleanup.");
