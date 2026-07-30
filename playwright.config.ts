import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir:"tests/e2e",fullyParallel:false,retries:0,
  globalSetup:"./tests/e2e/globalSetup.ts",
  use:{baseURL:"http://127.0.0.1:4173",trace:"retain-on-failure"},
});
