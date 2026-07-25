import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        env: {
            DATABASE_URL: "postgresql://test:test@localhost:5432/test",
            JWT_SECRET: "test-secret-key-for-ci-only",
            CORS_ORIGIN: "http://localhost:5173",
            FRONTEND_URL: "http://localhost:5173"
        }
    }
});