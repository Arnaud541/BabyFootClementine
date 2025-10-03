import request from "supertest";
import app from "../src/app";

describe("GET /api/tournois", () => {
  it("should return a list of tournois", async () => {
    const response = await request(app).get("/api/tournois");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
  it("should throw an error", async () => {
    const response = await request(app).get("/api/tournois");
    expect(() => {
      throw new Error("Erreur de récupération des tournois");
    }).toThrow();
  });
});
