import express from "express";
import { getDocuments, createDocument, deleteDocument } from "../controllers/DocumentController.js";

const documentRouter = express.Router();

documentRouter.get("/", getDocuments);
documentRouter.post("/", createDocument);
documentRouter.delete("/:id", deleteDocument);

export default documentRouter;
