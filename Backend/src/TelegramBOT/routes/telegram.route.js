import express from "express";
import { handleTelegramWebhook,getTelegramConnectUrl,getTelegramStatus} 
 from "../controller/telegram.controller.js";
import verifyJWT from '../../Feature/Auth/middleware/verifyJWT.js'
const TelegramRoute = express.Router();

TelegramRoute.post("/webhook", handleTelegramWebhook);
TelegramRoute.get("/connect",verifyJWT,getTelegramConnectUrl);
TelegramRoute.get("/status",verifyJWT,getTelegramStatus);

export default TelegramRoute;
