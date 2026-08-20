import express from "express";
import { handleTelegramWebhook,getTelegramConnectUrl } from "../controller/telegram.controller.js";
import verifyJWT from '../../Feature/Auth/middleware/verifyJWT.js'
const TelegramRoute = express.Router();

TelegramRoute.post("/webhook", handleTelegramWebhook);
TelegramRoute.get("/connect",verifyJWT,getTelegramConnectUrl);
export default TelegramRoute;
