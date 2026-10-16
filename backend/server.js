import "dotenv/config";
import express from "express";
import comparisonsRouter from "./routes/comparisons.js";
import { connectDatabase } from "./config/database.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const port = Number(process.env.PORT) || 3001;

app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/comparisons", comparisonsRouter);
app.use(errorHandler);

async function start() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required. Configure it in backend/.env.");
  }

  await connectDatabase(process.env.MONGODB_URI);
  app.listen(port, () => {
    console.log(`API server listening on http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start the API server:", error);
  process.exitCode = 1;
});
