import express, { json } from "express";
import AuthRouter from "./Feature/Auth/routes/auth.routes.js";
import PreferenceRoute from "./Feature/Prefrence/routes/preference.route.js";
import SourceRoute from "./Feature/NewsSource/routes/source.route.js";
import TelegramRoute from "./TelegramBOT/routes/telegram.route.js";
import NewsRoute from "./Feature/NewsForWeb/routes/news.route.js";
import cookieParser from "cookie-parser";

// import helmet from "helmet";
import cors from "cors";

const app = express();
const allowedOrigins = process.env.FRONTEND_CLIENT_ID.split(",");

// // Trust Render's reverse proxy so req.ip / X-Forwarded-For
// app.set("trust proxy", 1);

// app.use(
//   helmet({
//     crossOriginOpenerPolicy: false,
//     crossOriginResourcePolicy: {
//       policy: "cross-origin",
//     },
//   }),
// );

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    exposedHeaders: ["Content-Disposition"],
  }),
);

app.use(express.json());
app.use(cookieParser());


// app.get("/health", (req, res) => {
//   res.status(200).json({
//     success: true,
//     status: "OK",
//     message: "NewsMint API is healthy",
//     uptime: Math.floor(process.uptime()),
//     timestamp: new Date().toISOString(),
//   });
// });

app.use("/api", AuthRouter);
app.use("/api/preferences", PreferenceRoute);
app.use('/api/sources',SourceRoute);
app.use("/api/telegram", TelegramRoute);
app.use("/api/news", NewsRoute);
export default app;
