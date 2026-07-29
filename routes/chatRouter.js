import express from "express";
import { handleChat } from "../controllers/ChatController.js";

const chatRouter = express.Router();

chatRouter.post("/", handleChat);

export default chatRouter;
