import express from 'express';
import { generateProductDescription, generateReviewSummary } from '../controllers/AIController.js';

const aiRouter = express.Router();

aiRouter.post('/generate-description', generateProductDescription);
aiRouter.get('/review-summary/:productId', generateReviewSummary); // AI-powered review summary

export default aiRouter;
