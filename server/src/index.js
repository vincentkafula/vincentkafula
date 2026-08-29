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
import paymentAuthorisationsRouter from "./routes/paymentAuthorisations.js";
import payrollRouter from "./routes/payroll.js";
import weeklyRegistersRouter from "./routes/weeklyRegisters.js";
import oasysChecksRouter from "./routes/oasysChecks.js";
import newsRouter from "./routes/news.js";
import productsRouter from "./routes/products.js";
import emailRouter from "./routes/email.js";

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
app.use("/api/payment-authorisations", paymentAuthorisationsRouter);
app.use("/api/payroll", payrollRouter);
app.use("/api/weekly-registers", weeklyRegistersRouter);
app.use("/api/oasys-checks", oasysChecksRouter);
app.use("/api/news", newsRouter);
app.use("/api/products", productsRouter);
app.use("/api/email", emailRouter);

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
