import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config();
const { DRIZZLE_DATABASE_URL } = process.env;

if (!DRIZZLE_DATABASE_URL) {
  throw new Error(
    "No DRIZZLE_DATABASE_URL defined in the environment variables. Please ensure it is set in the .env file.",
  );
}

export default defineConfig({
  schema: "src/lib/database/drizzle/stripe/turso-stripe-schema.ts",
  out: "./migrations",
  dialect: "sqlite",
  driver: "turso",
  dbCredentials: {
    url: process.env.DB_URL!,
    authToken: process.env.DB_TOKEN,
  },
});
