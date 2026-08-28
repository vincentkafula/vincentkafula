import express from "express";
import cors from "cors";
import "dotenv/config";
import { runMigrations } from "./db/migrate.js";
import quotationsRouter from "./routes/quotations.js";
import authRouter from "./routes/auth.js";
import invoicesRouter from "./routes/invoices.js";
import scheduledJobsRouter from "./routes/scheduledJobs.js";
import teamBookingsRouter from "./routes/teamBookings.js";
import jobsheetsRouter from "./routes/jobsheets.js";
import leaveRequestsRouter from "./routes/leaveRequests.js";

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
app.use("/api/scheduled-jobs", scheduledJobsRouter);
app.use("/api/team-bookings", teamBookingsRouter);
app.use("/api/jobsheets", jobsheetsRouter);
app.use("/api/leave-requests", leaveRequestsRouter);

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
