import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "./app.js";

describe("GET /api/health", () => {
    it("responde 200 con el estado del servicio", async () => {
        const response = await request(app).get("/api/health");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: "ok", service: "gemquest-api" });
    });
});

describe("Rutas inexistentes", () => {
    it("responde 404 para una ruta no definida", async () => {
        const response = await request(app).get("/api/no-existe");

        expect(response.status).toBe(404);
    });
});