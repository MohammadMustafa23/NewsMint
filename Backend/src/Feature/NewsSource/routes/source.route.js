import express from "express";
import { getAllSources,getMySources,addSource,removeSource } from "../controller/source.controller.js";
import verifyJWT from "../../Auth/middleware/verifyJWT.js";
import { readSourcesLimiter, selectSourceLimiter, removeSourceLimiter } from "../middleware/rateLimit/sourceRateLimiter.js";

const SourceRoute = express.Router();

SourceRoute.get("/all-sources", readSourcesLimiter, verifyJWT, getAllSources);
SourceRoute.get("/my-sources", readSourcesLimiter, verifyJWT, getMySources);
SourceRoute.post("/select", selectSourceLimiter, verifyJWT, addSource);
SourceRoute.delete("/select/:sourceId", removeSourceLimiter, verifyJWT, removeSource);


export default SourceRoute;


