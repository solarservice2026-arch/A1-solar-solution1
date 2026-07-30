import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "./app.js";
describe("API", () => {
  it("reports health", async () => {
    const response = await request(app).get("/api/v1/health");
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
  it("rejects invalid enquiries", async () => {
    const response = await request(app).post("/api/v1/public/enquiries").send({ name: "A" });
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });
});
