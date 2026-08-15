import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import connectDB from "./src/db/db.connection.js";
import { connectRedis } from "./src/config/redis.js";
import { PORT } from './src/config/env.js'


// Mongo DB Connection Check
connectDB();

// Redis Connection
connectRedis();

app.listen(PORT, () => {
  console.log("🚀 Server Running on Port", PORT);
});
