import express from "express";

import verifyJWT from "../../Auth/middleware/verifyJWT.js";

import { getTopNews, getCategoryNews } from "../controller/news.controller.js";

import { personalizedNewsLimiter } from "../middleware/rateLimit/newsRateLimiter.js";

const NewsRoute = express.Router();
NewsRoute.get("/top", personalizedNewsLimiter, verifyJWT, getTopNews);

NewsRoute.get(
  "/category-news",
  personalizedNewsLimiter,
  verifyJWT,
  getCategoryNews,
);

export default NewsRoute;
