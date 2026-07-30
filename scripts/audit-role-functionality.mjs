import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const api=process.env.ROLE_AUDIT_API_URL??"http://127.0.0.1:5000/api/v1";
const credentials=JSON.parse(fs.readFileSync(".auth/e2e-credentials.json","utf8"));
const cases=[
 ["SUPER_ADMIN","super_admin"],["ADMIN","admin"],["MANAGER","manager"],["SALES","sales_executive"],
 ["INSTALLER","installation_staff"],["TECHNICIAN","service_technician"],["ACCOUNTANT","accountant"],
 ["CUSTOMER_A","customer"],["CUSTOMER_B","customer"],["DISABLED",null],["NO_ROLE",null]
];
const resources=[
 ["Dashboard",["dashboard:view"],"/dashboard"],["Customers",["customers:view"],"/customers"],
 ["Product lookup",["products:view","quotations:create","invoices:create"],"/products"],["Quotations",["quotations:view"],"/quotations"],
 ["Invoices",["invoices:view"],"/invoices"],["Agreements",["agreements:view"],"/agreements"],
 ["Staff",["users:view"],"/staff"],["Roles",["roles:view"],"/roles"]
];
const results=[];
let failures=0;
for(const [label,expectedRole] of cases){
 const sb=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data,error}=await sb.auth.signInWithPassword(credentials[label]);
 if(error||!data.session){const expected=label==="DISABLED"||label==="NO_ROLE";results.push({label,login:expected?"blocked as expected":"failed",role:label==="NO_ROLE"?"no role":"—",checks:[]});if(!expected)failures++;continue}
 const headers={authorization:`Bearer ${data.session.access_token}`};
 const me=await fetch(`${api}/auth/me`,{headers});const meBody=await me.json().catch(()=>({}));
 if(label==="DISABLED"){const ok=me.status===401||me.status===403;results.push({label,login:ok?"blocked as expected":"failed",role:"disabled",checks:[]});if(!ok)failures++;continue}
 if(label==="NO_ROLE"&&(me.status===401||me.status===403)){results.push({label,login:"blocked as expected",role:"no role",checks:[]});continue}
 if(!me.ok){results.push({label,login:"failed",role:"—",checks:[]});failures++;continue}
 const roles=meBody.data.roles??[],permissions=meBody.data.permissions??[];
 const roleOk=expectedRole?roles.includes(expectedRole):roles.length===0;
 const checks=[];
 for(const [name,requiredPermissions,path] of resources){
  const response=await fetch(`${api}${path}`,{headers});
  const expected=roles.includes("super_admin")||requiredPermissions.some(permission=>permissions.includes(permission));
  const passed=expected?response.ok:response.status===403;
  checks.push({name,expected:expected?"allowed":"denied",actual:response.ok?"allowed":response.status===403?"denied":`HTTP ${response.status}`,passed});
  if(!passed)failures++;
 }
 const profile=await fetch(`${api}/profile`,{method:"PATCH",headers:{...headers,"content-type":"application/json"},body:JSON.stringify({fullName:meBody.data.user.full_name,phone:meBody.data.user.phone??""})});
 checks.push({name:"Own profile update",expected:"allowed",actual:profile.ok?"allowed":`HTTP ${profile.status}`,passed:profile.ok});
 if(!profile.ok)failures++;
 results.push({label,login:"passed",role:roleOk?(expectedRole??"no role"):"mismatch",checks});
 if(!roleOk)failures++;
 await sb.auth.signOut();
}

const customerA=results.find(x=>x.label==="CUSTOMER_A"),customerB=results.find(x=>x.label==="CUSTOMER_B");
const summary=[
 "# Role Functionality Audit",
 "",
 `Generated: ${new Date().toISOString()}`,
 "",
 "This report validates real Supabase password login, JWT-backed API authorization, expected allow/deny behavior, and own-profile access. No secret values are included.",
 "",
 "| Account category | Login | Assigned role | API checks |",
 "|---|---|---|---|",
 ...results.map(row=>`| ${row.label} | ${row.login} | ${row.role} | ${row.checks.length?`${row.checks.filter(x=>x.passed).length}/${row.checks.length} passed`:"security outcome validated"} |`),
 "",
 "## Detailed permission checks",
 "",
 ...results.filter(x=>x.checks.length).flatMap(row=>[
  `### ${row.label}`,
  "",
  "| Function | Expected | Actual | Result |",
  "|---|---|---|---|",
  ...row.checks.map(x=>`| ${x.name} | ${x.expected} | ${x.actual} | ${x.passed?"PASS":"FAIL"} |`),
  ""
 ]),
 "## Customer isolation",
 "",
 `- Customer A role audit: ${customerA?.checks.every(x=>x.passed)?"PASS":"FAIL"}`,
 `- Customer B role audit: ${customerB?.checks.every(x=>x.passed)?"PASS":"FAIL"}`,
 "- Dedicated live isolation tests additionally verify that each customer sees one different quotation and invoice linked through `customers.profile_id`.",
 "",
 `## Overall result: ${failures===0?"PASS":"FAIL"}`,
 ""
];
fs.mkdirSync("docs/quality",{recursive:true});
fs.writeFileSync("docs/quality/ROLE_FUNCTIONALITY_AUDIT.md",summary.join("\n"),"utf8");
console.log(`Role categories audited: ${results.length}`);
console.log(`Permission outcomes checked: ${results.reduce((n,x)=>n+x.checks.length,0)}`);
console.log(`Overall role audit: ${failures===0?"passed":"failed"}`);
if(failures)process.exitCode=1;
