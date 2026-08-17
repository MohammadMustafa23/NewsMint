import express from "express";
import { getAllSources,getMySources,addSource,removeSource } from "../controller/source.controller.js";
import verifyJWT from "../../Auth/middleware/verifyJWT.js";

const SourceRoute = express.Router();

SourceRoute.get("/all-sources", verifyJWT, getAllSources);
SourceRoute.get("/my-sources", verifyJWT, getMySources);
SourceRoute.post("/select", verifyJWT, addSource);
SourceRoute.delete("/select/:sourceId",verifyJWT,removeSource);


export default SourceRoute;


