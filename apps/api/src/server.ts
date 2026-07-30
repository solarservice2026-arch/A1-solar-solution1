import { env } from "./env.js";
import { app } from "./app.js";
app.listen(env.PORT, () => console.log(`A1 API listening on ${env.PORT}`));
