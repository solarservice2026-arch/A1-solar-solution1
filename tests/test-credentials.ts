import "dotenv/config";
import { readFileSync } from "node:fs";
type Credential={email:string;password:string};
export function credential(label:string):Credential|null{
 const email=process.env[`E2E_${label}_EMAIL`],password=process.env[`E2E_${label}_PASSWORD`];
 if(email&&password)return{email,password};
 try{const stored=JSON.parse(readFileSync(".auth/e2e-credentials.json","utf8")) as Record<string,Credential>;return stored[label]??null}catch{return null}
}
