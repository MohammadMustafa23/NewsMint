import express from "express";
import verifyJWT from "../../Auth/middleware/verifyJWT.js";
import { getMyNews } from "../controller/news.controller.js";
import { personalizedNewsLimiter } from "../middleware/rateLimit/newsRateLimiter.js";
const NewsRoute = express.Router();

NewsRoute.get("/my-news", personalizedNewsLimiter, verifyJWT, getMyNews);

export default NewsRoute;
