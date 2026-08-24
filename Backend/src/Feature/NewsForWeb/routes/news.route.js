import express from "express";
import verifyJWT from "../../Auth/middleware/verifyJWT.js";
import { getMyNews } from "../controller/news.controller.js";

const NewsRoute = express.Router();

NewsRoute.get("/my-news", verifyJWT, getMyNews);

export default NewsRoute;
