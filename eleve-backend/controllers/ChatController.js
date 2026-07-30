import OpenAI from "openai";
import Product from "../models/Product.js";
import Document from "../models/Document.js";
import { generateEmbedding } from "../utils/ragUtils.js";
import similarity from "cosine-similarity";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const handleChat = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    // 1. Generate embedding for user's message
    const userEmbedding = await generateEmbedding(message);

    // 2. Retrieve products and documents with embeddings
    const allProducts = await Product.find({ embedding: { $exists: true, $ne: [] } });
    const allDocuments = await Document.find({ embedding: { $exists: true, $ne: [] } });

    // 3. Perform in-memory cosine similarity search (fallback if Atlas Vector Search isn't set up)
    const scoredProducts = allProducts.map((product) => {
      const score = similarity(userEmbedding, product.embedding);
      return { item: product, type: "product", score };
    });

    const scoredDocuments = allDocuments.map((doc) => {
      const score = similarity(userEmbedding, doc.embedding);
      return { item: doc, type: "document", score };
    });

    const allScoredItems = [...scoredProducts, ...scoredDocuments];

    // 4. Sort and get top matches
    allScoredItems.sort((a, b) => b.score - a.score);
    
    // We can take the top 3 products and top 2 documents
    const topProductMatches = allScoredItems.filter(x => x.type === "product").slice(0, 3).map(x => x.item);
    const topDocumentMatches = allScoredItems.filter(x => x.type === "document").slice(0, 2).map(x => x.item);

    // 5. Construct context string from top matches
    let contextString = "Available Products in Catalog:\\n";
    if (topProductMatches.length > 0) {
      topProductMatches.forEach((prod, index) => {
        contextString += `${index + 1}. ${prod.name} - Price: $${prod.price} - Category: ${prod.category} - Scent: ${prod.scentFamily?.join(", ")} - Good for: ${prod.skinType?.join(", ")}\\nDescription: ${prod.description}\\n\\n`;
      });
    } else {
      contextString += "No relevant products found or catalog embeddings missing.\\n";
    }

    contextString += "\\nCompany Knowledge Base / Policies:\\n";
    if (topDocumentMatches.length > 0) {
      topDocumentMatches.forEach((doc, index) => {
        contextString += `${index + 1}. ${doc.title}\\nContent: ${doc.content}\\n\\n`;
      });
    } else {
      contextString += "No relevant documents found.\\n";
    }

    // 6. Define system prompt for the OpenAI chat completion
    const systemPrompt = `You are an elegant, knowledgeable virtual beauty and fragrance consultant for the luxury brand ELEVÉ. 
Your goal is to assist customers, answer their questions, and recommend products strictly based on the following catalog context.
Use an inviting, luxurious, and helpful tone.
Keep responses concise but premium. Do not hallucinate products that are not in the context.

Context:
${contextString}`;

    // 7. Format history for OpenAI
    const formattedHistory = [
      { role: "system", content: systemPrompt },
      ...(history || []).map((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    // 8. Generate response from OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: formattedHistory,
      temperature: 0.7,
    });

    const aiMessage = completion.choices[0].message.content;

    // 9. Filter recommended products to only those mentioned in the response
    const mentionedProducts = topProductMatches.filter(p => aiMessage.toLowerCase().includes(p.name.toLowerCase()));

    const structuredRecommendations = mentionedProducts.map((p) => ({
      productId: p.productId,
      name: p.name,
      price: p.price,
      image: p.images && p.images.length > 0 ? p.images[0] : null,
      category: p.category
    }));

    res.status(200).json({
      success: true,
      message: aiMessage,
      recommendedProducts: structuredRecommendations,
    });
  } catch (error) {
    console.error("Chat Controller Error:", error);
    res.status(500).json({ success: false, error: "An error occurred while processing the chat." });
  }
};
