import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "process due monitors",
  { minutes: 1 },
  internal.scheduler.processDueMonitors
);

export default crons;
