import mongoose from "mongoose";
import dotenv from "dotenv";
import { backfillEmbeddings } from "./utils/ragUtils.js";

dotenv.config();

const mongoUrl = process.env.MONGO_DB_URI;

mongoose.connect(mongoUrl, {})
  .then(async () => {
    console.log("Database Connected. Starting Backfill...");
    await backfillEmbeddings();
    console.log("Backfill process finished. Exiting...");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });
