import OpenAI from "openai";
import Product from "../models/Product.js";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates an embedding for a given string using OpenAI.
 * @param {string} text - The input string to embed.
 * @returns {Promise<number[]>} - The vector embedding.
 */
export async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

/**
 * Helper to construct a single searchable text string from a Product.
 * @param {Object} product - The product document.
 * @returns {string} - Combined text for embedding.
 */
export function getProductTextForEmbedding(product) {
  return `
    Name: ${product.name}
    Category: ${product.category}
    Scent Family: ${product.scentFamily?.join(", ")}
    Skin Type: ${product.skinType?.join(", ")}
    Benefits: ${product.benefits?.join(", ")}
    Description: ${product.description}
  `.trim();
}

/**
 * Utility to backfill embeddings for all products that don't have one.
 * You can call this once to populate the database.
 */
export async function backfillEmbeddings() {
  console.log("Starting embedding backfill...");
  try {
    const products = await Product.find({ embedding: { $exists: false } });
    console.log(`Found ${products.length} products to backfill.`);

    for (const product of products) {
      const text = getProductTextForEmbedding(product);
      const embedding = await generateEmbedding(text);
      product.embedding = embedding;
      await product.save();
      console.log(`Successfully generated embedding for ${product.name}`);
    }
    console.log("Backfill complete!");
  } catch (error) {
    console.error("Backfill failed:", error);
  }
}
