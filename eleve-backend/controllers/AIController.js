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
Keep it concise (around 3-4 short paragraphs). Use HTML formatting like <p> and <strong> where appropriate to make it look beautiful on the website.
Do not use markdown formatting outside of HTML.

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

    const generatedText = completion.choices[0].message.content;

    return res.status(200).json({ success: true, description: generatedText });
  } catch (error) {
    console.error("AI Generation Error:", error);
    return res.status(500).json({ success: false, message: "Failed to generate description", error: error.message });
  }
};
