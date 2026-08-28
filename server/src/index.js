import express from "express";
import cors from "cors";
import "dotenv/config";
import { runMigrations } from "./db/migrate.js";
import quotationsRouter from "./routes/quotations.js";
import authRouter from "./routes/auth.js";
import invoicesRouter from "./routes/invoices.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "politian-backend" });
});

app.use("/api/auth", authRouter);
app.use("/api/quotations", quotationsRouter);
app.use("/api/invoices", invoicesRouter);

async function start() {
  try {
    await runMigrations();
  } catch (err) {
    console.error("Failed to run migrations:", err);
  }
  app.listen(PORT, () => {
    console.log(`Politian backend listening on port ${PORT}`);
  });
}

start();
