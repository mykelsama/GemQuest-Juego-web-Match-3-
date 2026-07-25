import cors from "cors";
import express from "express";

import { env } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import progressRoutes from "./routes/progress.routes.js";
import scoresRoutes from "./routes/scores.routes.js";

/** Aplicacion Express con CORS, JSON y rutas de la API. */
const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true
  })
);
app.use(express.json());

/** Comprueba que el servidor API esta activo. */
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "gemquest-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/scores", scoresRoutes);

export default app;
