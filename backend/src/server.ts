import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import connectDB from "./config/db";

const REQUIRED_ENV = ["MONGO_URI", "JWT_SECRET"];
const missing = REQUIRED_ENV.filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

for (const name of ["GEMINI_API_KEY", "ELEVENLABS_API_KEY"]) {
  if (!process.env[name]) {
    console.warn(`Warning: ${name} is not set — related features will fail`);
  }
}

const PORT = Number(process.env.PORT) || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
