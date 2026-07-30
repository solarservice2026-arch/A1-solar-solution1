import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const required=["SUPABASE_URL","SUPABASE_SERVICE_ROLE_KEY"];
for(const key of required)if(!process.env[key])throw new Error(`Missing ${key}`);
const admin=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const credentialsPath=".auth/e2e-credentials.json";
const credentials=JSON.parse(fs.readFileSync(credentialsPath,"utf8"));
const identities={
 SUPER_ADMIN:["superadmin@a1solar.test","A1 Solar Super Admin"],
 ADMIN:["admin@a1solar.test","A1 Solar Admin"],
 MANAGER:["manager@a1solar.test","Sales Manager"],
 SALES:["sales@a1solar.test","Sales Executive"],
 INSTALLER:["installer@a1solar.test","Installation Staff"],
 TECHNICIAN:["technician@a1solar.test","Service Technician"],
 ACCOUNTANT:["accounts@a1solar.test","Accounts Officer"],
 CUSTOMER_A:["customer.home@a1solar.test","Rohan Sharma"],
 CUSTOMER_B:["customer.business@a1solar.test","Meera Enterprises"],
 DISABLED:["disabled@a1solar.test","Disabled User"],
 NO_ROLE:["norole@a1solar.test","No Role User"]
};

const {data:list,error:listError}=await admin.auth.admin.listUsers({page:1,perPage:1000});
if(listError)throw listError;
for(const [label,[email,fullName]] of Object.entries(identities)){
 const existing=list.users.find(user=>user.email===credentials[label].email)||list.users.find(user=>user.email===email);
 if(!existing)throw new Error(`Missing tagged user ${label}`);
 const {error}=await admin.auth.admin.updateUserById(existing.id,{email,email_confirm:true,user_metadata:{...existing.user_metadata,full_name:fullName,e2e_test_user:true,role_demo:true}});
 if(error)throw error;
 credentials[label].email=email;
 await admin.from("profiles").update({full_name:fullName,email_verified:true}).eq("id",existing.id);
}
fs.writeFileSync(credentialsPath,JSON.stringify(credentials),{encoding:"utf8",mode:0o600});

const userId=(label)=>list.users.find(user=>user.email===credentials[label].email)?.id
  ?? list.users.find(user=>user.email===Object.entries(identities).find(([key])=>key===label)?.[1][0])?.id;
const refreshed=(await admin.auth.admin.listUsers({page:1,perPage:1000})).data.users;
const idFor=(label)=>refreshed.find(user=>user.email===identities[label][0])?.id;

const customers=[
 {customer_number:"DEMO-CUS-HOME",profile_id:idFor("CUSTOMER_A"),name:"Rohan Sharma",customer_type:"Residential",mobile:"9876500001",email:identities.CUSTOMER_A[0],consumer_number:"DEMO-HOME-001",provider:"State DISCOM",status:"Active"},
 {customer_number:"DEMO-CUS-BUSINESS",profile_id:idFor("CUSTOMER_B"),name:"Meera Enterprises",customer_type:"Commercial",mobile:"9876500002",email:identities.CUSTOMER_B[0],gst_number:"07DEMO1234A1Z5",consumer_number:"DEMO-BIZ-001",provider:"State DISCOM",status:"Active"}
];
for(const row of customers){const {error}=await admin.from("customers").upsert(row,{onConflict:"customer_number"});if(error)throw error}
const {data:customerRows,error:customerError}=await admin.from("customers").select("id,customer_number").in("customer_number",customers.map(x=>x.customer_number));
if(customerError)throw customerError;
const customer=(number)=>customerRows.find(x=>x.customer_number===number).id;

const products=[
 {sku:"DEMO-PANEL-550W",name:"Mono PERC Solar Panel 550W",category:"Solar Panel",brand:"A1 Select",model:"MP-550",unit:"Nos",purchase_price:10200,selling_price:12500,tax_rate:12,minimum_stock:10,active:true},
 {sku:"DEMO-INV-5KW",name:"On-grid Inverter 5kW",category:"Inverter",brand:"A1 Select",model:"OG-5K",unit:"Nos",purchase_price:41000,selling_price:49500,tax_rate:12,minimum_stock:2,active:true},
 {sku:"DEMO-STRUCT-5KW",name:"5kW Mounting Structure",category:"Structure",brand:"A1 Fabrication",model:"MS-5K",unit:"Set",purchase_price:26000,selling_price:34000,tax_rate:18,minimum_stock:1,active:true}
];
for(const row of products){const {error}=await admin.from("products").upsert(row,{onConflict:"sku"});if(error)throw error}

const quotes=[
 {quotation_number:"DEMO-QUO-HOME",customer_id:customer("DEMO-CUS-HOME"),quotation_date:"2026-07-28",valid_until:"2026-08-15",capacity_kw:5,status:"Approved",subtotal:285000,discount:10000,tax:33000,grand_total:308000,terms:"25% advance, balance linked to installation milestones.",created_by:idFor("MANAGER")},
 {quotation_number:"DEMO-QUO-BUSINESS",customer_id:customer("DEMO-CUS-BUSINESS"),quotation_date:"2026-07-28",valid_until:"2026-08-15",capacity_kw:25,status:"Sent",subtotal:1125000,discount:25000,tax:132000,grand_total:1232000,terms:"Commercial proposal valid for 18 days.",created_by:idFor("MANAGER")}
];
for(const row of quotes){const {error}=await admin.from("quotations").upsert(row,{onConflict:"quotation_number"});if(error)throw error}
const {data:quoteRows}=await admin.from("quotations").select("id,quotation_number").in("quotation_number",quotes.map(x=>x.quotation_number));
const quote=(number)=>quoteRows.find(x=>x.quotation_number===number).id;

const invoices=[
 {invoice_number:"DEMO-INV-HOME",customer_id:customer("DEMO-CUS-HOME"),invoice_date:"2026-07-28",due_date:"2026-08-05",total:77000,paid_amount:77000,status:"Paid"},
 {invoice_number:"DEMO-INV-BUSINESS",customer_id:customer("DEMO-CUS-BUSINESS"),invoice_date:"2026-07-28",due_date:"2026-08-10",total:308000,paid_amount:100000,status:"Partially Paid"}
];
for(const row of invoices){const {error}=await admin.from("invoices").upsert(row,{onConflict:"invoice_number"});if(error)throw error}
const projects=[
 {project_number:"DEMO-PRJ-HOME",customer_id:customer("DEMO-CUS-HOME"),quotation_id:quote("DEMO-QUO-HOME"),capacity_kw:5,stage:"Installation",progress:60,project_value:308000,start_date:"2026-07-30",expected_completion_date:"2026-08-08"},
 {project_number:"DEMO-PRJ-BUSINESS",customer_id:customer("DEMO-CUS-BUSINESS"),quotation_id:quote("DEMO-QUO-BUSINESS"),capacity_kw:25,stage:"Confirmed",progress:15,project_value:1232000,start_date:"2026-08-05",expected_completion_date:"2026-08-25"}
];
for(const row of projects){const {error}=await admin.from("projects").upsert(row,{onConflict:"project_number"});if(error)throw error}
const tickets=[
 {ticket_number:"DEMO-TKT-HOME",customer_id:customer("DEMO-CUS-HOME"),subject:"Installation schedule confirmation",description:"Customer requested confirmation of installation date.",priority:"Medium",status:"Open",assigned_to:idFor("TECHNICIAN")},
 {ticket_number:"DEMO-TKT-BUSINESS",customer_id:customer("DEMO-CUS-BUSINESS"),subject:"Site access coordination",description:"Coordinate commercial site access with facility team.",priority:"High",status:"Open",assigned_to:idFor("TECHNICIAN")}
];
for(const row of tickets){const {error}=await admin.from("service_tickets").upsert(row,{onConflict:"ticket_number"});if(error)throw error}

const displayNames={SUPER_ADMIN:"Super Admin",ADMIN:"Admin",MANAGER:"Manager",SALES:"Sales Executive",INSTALLER:"Installation Staff",TECHNICIAN:"Service Technician",ACCOUNTANT:"Accountant",CUSTOMER_A:"Residential Customer",CUSTOMER_B:"Commercial Customer",DISABLED:"Disabled security test",NO_ROLE:"No-role security test"};
const lines=["A1 Solar role demo logins","","Use http://localhost:5173/login","These are dedicated test-project users. Sign out before switching roles.",""];
for(const key of Object.keys(identities))lines.push(`[${displayNames[key]}]`,`Email: ${credentials[key].email}`,`Password: ${credentials[key].password}`,"");
fs.writeFileSync(".auth/role-test-logins.txt",lines.join("\n"),{encoding:"utf8",mode:0o600});
console.log("Role demo identities: configured");
console.log("Customer profile links: configured");
console.log("Customer business records: configured");
console.log("Credential file: synchronized");
