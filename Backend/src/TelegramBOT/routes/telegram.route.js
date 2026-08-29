import express from "express";
import { getTelegramConnectUrl,getTelegramStatus} 
 from "../controller/telegram.controller.js";
import verifyJWT from '../../Feature/Auth/middleware/verifyJWT.js'
const TelegramRoute = express.Router();

TelegramRoute.get("/connect",verifyJWT,getTelegramConnectUrl);
TelegramRoute.get("/status",verifyJWT,getTelegramStatus);

export default TelegramRoute;
