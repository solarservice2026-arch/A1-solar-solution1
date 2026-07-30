import "dotenv/config";
import type { Server } from "node:http";
import { createServer } from "vite";
export default async function setup(){
 process.env.VITE_API_URL="http://127.0.0.1:5001/api/v1";
 const {app}=await import("../../apps/api/src/app");
 const apiServer:Server=await new Promise(resolve=>{const server=app.listen(5001,"127.0.0.1",()=>resolve(server))});
 const server=await createServer({root:"apps/web",server:{host:"127.0.0.1",port:4173,strictPort:true}});
 await server.listen();
 return async()=>{await server.close();await new Promise<void>((resolve,reject)=>apiServer.close(error=>error?reject(error):resolve()))};
}
