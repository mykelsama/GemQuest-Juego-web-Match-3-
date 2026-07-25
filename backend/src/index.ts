import app from "./app.js";
import { env } from "./config/env.js";

export default app;

if (!process.env.VERCEL) {
  app.listen(env.PORT, () => {
    console.log(`GemQuest API escuchando en http://localhost:${env.PORT}`);
  });
}
