import express from 'express';
import { generateProductDescription } from '../controllers/AIController.js';

const aiRouter = express.Router();

aiRouter.post('/generate-description', generateProductDescription);

export default aiRouter;
