import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateProductDescription = async (req, res) => {
  try {
    const { name, category, brand, attributes } = req.body;

    if (!name || !category) {
      return res.status(400).json({ success: false, message: "Product name and category are required." });
    }

    // Build context string from attributes
    let contextStr = `Category: ${category}\nProduct Name: ${name}\n`;
    if (brand) contextStr += `Brand: ${brand}\n`;
    
    if (attributes && attributes.length > 0) {
      contextStr += `Key Attributes & Ingredients: ${attributes.join(", ")}\n`;
    }

    const systemPrompt = `You are a world-class luxury copywriter for ELEVÉ, a premium beauty and fragrance e-commerce brand.
Your task is to write a short, evocative, storytelling-heavy product description suitable for a high-end storefront. 
Use rich, sensory language that sells an experience, not just a product. 
Keep it concise (around 3-4 short paragraphs).
IMPORTANT: Output pure, normal plain text ONLY. Do NOT use any HTML tags (such as <p>, <strong>, <span>, <div>, <br>) or markdown formatting (such as **, ##, *). Separate paragraphs with clean double line breaks (\n\n).

Product Details:
${contextStr}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using mini for fast, cost-effective generation
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate the product description." }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const generatedText = completion.choices[0].message.content || "";

    // Clean up any stray HTML tags or markdown bold formatting
    const cleanedText = generatedText
      .replace(/<[^>]*>/g, '') // strip HTML tags
      .replace(/\*\*(.*?)\*\*/g, '$1') // strip markdown bold
      .trim();

    return res.status(200).json({ success: true, description: cleanedText });
  } catch (error) {
    console.error("AI Generation Error:", error);
    return res.status(500).json({ success: false, message: "Failed to generate description", error: error.message });
  }
};

// ─── Review Sentiment Analysis & Auto-Moderation ────────────────────────────

/**
 * analyzeReview — called internally (not an HTTP handler).
 * Uses GPT-4o-mini to detect sentiment and check for spam/profanity.
 * Returns gracefully on error so it never blocks review submission.
 */
export const analyzeReview = async (reviewText, rating) => {
  try {
    const prompt = `You are a review moderation AI for ELEVÉ, a luxury beauty brand.

Analyze this customer review and return a JSON object with these exact fields:
- "sentiment": one of "positive", "neutral", or "negative"
- "flagged": true if the review contains profanity, hate speech, spam, or is completely irrelevant/gibberish, otherwise false
- "flagReason": a short reason string if flagged (e.g. "Contains profanity"), or "" if not flagged

Review text: "${reviewText}"
Star rating: ${rating}/5

Return ONLY a raw JSON object. No markdown. No explanation. Example:
{"sentiment": "positive", "flagged": false, "flagReason": ""}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      max_tokens: 100,
    });

    const raw = completion.choices[0].message.content.trim();
    // Strip any markdown code fences GPT might add
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const result = JSON.parse(cleaned);

    return {
      sentiment: result.sentiment || 'unanalyzed',
      flagged: result.flagged === true,
      flagReason: result.flagReason || ''
    };
  } catch (err) {
    console.error("Review analysis error:", err);
    // Fail gracefully — never block review submission if AI fails
    return { sentiment: 'unanalyzed', flagged: false, flagReason: '' };
  }
};

// ─── Review Summary Generator (Admin HTTP Handler) ───────────────────────────

/**
 * generateReviewSummary — GET /api/ai/review-summary/:productId
 * Fetches up to 100 approved reviews for a product and produces a
 * concise one-paragraph insight paragraph for the admin dashboard.
 */
export const generateReviewSummary = async (req, res) => {
  try {
    const { productId } = req.params;

    // Dynamic import to avoid circular dependency with ReviewController
    const Review = (await import('../models/Review.js')).default;

    const reviews = await Review.find({
      productId,
      status: 'approved',
      hidden: false
    })
      .select('review rating')
      .limit(100);

    if (reviews.length < 5) {
      return res.json({
        success: false,
        message: `Not enough reviews to summarize (need at least 5, have ${reviews.length})`
      });
    }

    const reviewTexts = reviews
      .map((r, i) => `Review ${i + 1} (${r.rating}★): ${r.review}`)
      .join('\n\n');

    const prompt = `You are a data analyst for ELEVÉ, a luxury beauty e-commerce brand.

Based on these ${reviews.length} customer reviews, write a single concise paragraph (3-4 sentences) summarizing overall customer sentiment.
- Mention what customers love most.
- Mention any common complaints or issues if they appear in more than ~10% of reviews.
- Be specific and factual. Reference actual product features mentioned in the reviews.
- Write in third person (e.g. "Customers love..." not "You will love...").
- Keep it under 80 words.
- Output plain text only. No bullet points. No markdown.

Reviews:
${reviewTexts}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 200,
    });

    const summary = completion.choices[0].message.content.trim();

    return res.json({
      success: true,
      summary,
      reviewCount: reviews.length
    });
  } catch (error) {
    console.error("Summary generation error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
