import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";
import Counter from "./models/Counter.js";
import { backfillEmbeddings } from "./utils/ragUtils.js";

dotenv.config();

const sampleProducts = [
  // Perfumes
  {
    productName: "Oud & Wood Extrait",
    name: "Oud & Wood Extrait",
    category: "perfumes",
    price: 185,
    lastPrice: 185,
    description: "A deep, luxurious oud blended with rich sandalwood and amber.",
    detailedDescription: "Sourced from the oldest agarwood trees, this Extrait de Parfum delivers an intoxicating, long-lasting scent perfect for evening wear.",
    stock: 50,
    rating: 4.9,
    reviewCount: 124,
    isBestSeller: true,
    scentFamily: ["woody", "oriental"],
    images: ["https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&auto=format&fit=crop&q=60"],
    tags: ["oud", "luxury", "evening"]
  },
  {
    productName: "Midnight Saffron",
    name: "Midnight Saffron",
    category: "perfumes",
    price: 150,
    lastPrice: 150,
    description: "Spicy saffron meets warm vanilla and dark rose.",
    detailedDescription: "A seductive and spicy blend, capturing the essence of the Middle East with hand-harvested crimson saffron.",
    stock: 35,
    rating: 4.7,
    reviewCount: 89,
    scentFamily: ["spicy", "floral"],
    images: ["https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=600&auto=format&fit=crop&q=60"],
    tags: ["saffron", "spicy"]
  },
  {
    productName: "Ceylon Jasmine",
    name: "Ceylon Jasmine",
    category: "perfumes",
    price: 120,
    lastPrice: 120,
    description: "Fresh, blooming jasmine intertwined with white musk.",
    stock: 100,
    rating: 4.8,
    reviewCount: 210,
    isBestSeller: true,
    scentFamily: ["floral", "fresh"],
    images: ["https://images.unsplash.com/photo-1595532542520-50294740d7c8?w=600&auto=format&fit=crop&q=60"],
    tags: ["jasmine", "fresh"]
  },
  {
    productName: "Royal Sandalwood",
    name: "Royal Sandalwood",
    category: "perfumes",
    price: 160,
    lastPrice: 160,
    description: "Creamy sandalwood paired with bright bergamot.",
    stock: 45,
    rating: 4.5,
    reviewCount: 65,
    isNew: true,
    scentFamily: ["woody", "fresh"],
    images: ["https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&auto=format&fit=crop&q=60"],
    tags: ["sandalwood", "creamy"]
  },
  {
    productName: "Velvet Rose & Amber",
    name: "Velvet Rose & Amber",
    category: "perfumes",
    price: 145,
    lastPrice: 145,
    description: "A rich floral bouquet enveloped in golden amber.",
    stock: 60,
    rating: 4.6,
    reviewCount: 92,
    scentFamily: ["floral", "oriental"],
    images: ["https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=600&auto=format&fit=crop&q=60"],
    tags: ["rose", "amber", "romantic"]
  },

  // Skincare
  {
    productName: "Argan Oil Radiance Serum",
    name: "Argan Oil Radiance Serum",
    category: "skincare",
    price: 85,
    lastPrice: 85,
    description: "Pure Moroccan Argan oil infused with Vitamin E for a glowing complexion.",
    stock: 120,
    rating: 4.9,
    reviewCount: 340,
    isBestSeller: true,
    benefits: ["hydrating", "brightening"],
    skinType: ["dry", "normal", "combination"],
    images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=60"],
    tags: ["argan", "serum", "glow"]
  },
  {
    productName: "Botanical Soothing Cream",
    name: "Botanical Soothing Cream",
    category: "skincare",
    price: 65,
    lastPrice: 65,
    description: "A rich cream designed to calm redness and repair the skin barrier.",
    stock: 80,
    rating: 4.7,
    reviewCount: 156,
    benefits: ["soothing", "calming", "hydrating"],
    skinType: ["sensitive", "dry"],
    images: ["https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&auto=format&fit=crop&q=60"],
    tags: ["cream", "sensitive"]
  },
  {
    productName: "Matcha Purifying Clay Mask",
    name: "Matcha Purifying Clay Mask",
    category: "skincare",
    price: 45,
    lastPrice: 45,
    description: "Draws out impurities and absorbs excess oil without drying the skin.",
    stock: 150,
    rating: 4.5,
    reviewCount: 98,
    benefits: ["brightening", "calming"],
    skinType: ["oily", "combination"],
    images: ["https://images.unsplash.com/photo-1596462502278-27bf84033001?w=600&auto=format&fit=crop&q=60"],
    tags: ["mask", "matcha", "detox"]
  },
  {
    productName: "Hyaluronic Acid Aqua Gel",
    name: "Hyaluronic Acid Aqua Gel",
    category: "skincare",
    price: 55,
    lastPrice: 55,
    description: "A weightless water gel that instantly quenches dehydrated skin.",
    stock: 200,
    rating: 4.8,
    reviewCount: 420,
    isBestSeller: true,
    benefits: ["hydrating", "energizing"],
    skinType: ["normal", "oily", "combination"],
    images: ["https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&auto=format&fit=crop&q=60"],
    tags: ["hyaluronic", "gel"]
  },
  {
    productName: "Rosehip Anti-Aging Elixir",
    name: "Rosehip Anti-Aging Elixir",
    category: "skincare",
    price: 95,
    lastPrice: 95,
    description: "Potent botanical elixir that visibly reduces fine lines and wrinkles.",
    stock: 75,
    rating: 4.6,
    reviewCount: 112,
    isNew: true,
    benefits: ["anti-aging", "brightening"],
    skinType: ["dry", "normal"],
    images: ["https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=600&auto=format&fit=crop&q=60"],
    tags: ["anti-aging", "rosehip"]
  },

  // Makeup
  {
    productName: "Luminous Silk Foundation",
    name: "Luminous Silk Foundation",
    category: "makeup",
    price: 68,
    lastPrice: 68,
    description: "Weightless liquid foundation for a radiant, airbrushed finish.",
    stock: 250,
    rating: 4.9,
    reviewCount: 560,
    isBestSeller: true,
    skinType: ["normal", "dry", "combination"],
    images: ["https://images.unsplash.com/photo-1631214500515-e4a1f0d828c4?w=600&auto=format&fit=crop&q=60"],
    tags: ["foundation", "silk"]
  },
  {
    productName: "Velvet Matte Lipstick - Crimson",
    name: "Velvet Matte Lipstick - Crimson",
    category: "makeup",
    price: 38,
    lastPrice: 38,
    description: "Intensely pigmented matte lipstick that never dries your lips.",
    stock: 180,
    rating: 4.7,
    reviewCount: 234,
    images: ["https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=60"],
    tags: ["lipstick", "matte"]
  },
  {
    productName: "Golden Hour Highlighter",
    name: "Golden Hour Highlighter",
    category: "makeup",
    price: 42,
    lastPrice: 42,
    description: "A finely milled powder that delivers a wet-shine golden glow.",
    stock: 90,
    rating: 4.8,
    reviewCount: 145,
    images: ["https://images.unsplash.com/photo-1599305090598-fe179d501227?w=600&auto=format&fit=crop&q=60"],
    tags: ["highlighter", "glow"]
  },
  {
    productName: "Botanical Mascara",
    name: "Botanical Mascara",
    category: "makeup",
    price: 34,
    lastPrice: 34,
    description: "Volumizing mascara enriched with plant-derived waxes.",
    stock: 300,
    rating: 4.4,
    reviewCount: 88,
    images: ["https://images.unsplash.com/photo-1631214500115-598fc2cb8d2d?w=600&auto=format&fit=crop&q=60"],
    tags: ["mascara", "eyes"]
  },
  {
    productName: "Satin Blush - Desert Rose",
    name: "Satin Blush - Desert Rose",
    category: "makeup",
    price: 40,
    lastPrice: 40,
    description: "A silky, blendable powder blush for a natural flush.",
    stock: 140,
    rating: 4.6,
    reviewCount: 110,
    images: ["https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600&auto=format&fit=crop&q=60"],
    tags: ["blush", "rose"]
  },

  // Tools
  {
    productName: "Rose Quartz Gua Sha",
    name: "Rose Quartz Gua Sha",
    category: "tools",
    price: 28,
    lastPrice: 28,
    description: "Authentic rose quartz tool for facial massage and lymphatic drainage.",
    stock: 200,
    rating: 4.9,
    reviewCount: 450,
    isBestSeller: true,
    benefits: ["calming", "energizing"],
    images: ["https://images.unsplash.com/photo-1615397323214-6110f09282f1?w=600&auto=format&fit=crop&q=60"],
    tags: ["guasha", "massage"]
  },
  {
    productName: "Artisan Makeup Brush Set",
    name: "Artisan Makeup Brush Set",
    category: "tools",
    price: 110,
    lastPrice: 110,
    description: "7-piece synthetic brush set crafted for flawless application.",
    stock: 50,
    rating: 4.8,
    reviewCount: 76,
    images: ["https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=600&auto=format&fit=crop&q=60"],
    tags: ["brushes", "set"]
  },
  {
    productName: "Sandalwood Hair Comb",
    name: "Sandalwood Hair Comb",
    category: "tools",
    price: 25,
    lastPrice: 25,
    description: "Hand-carved wooden comb that reduces static and distributes natural oils.",
    stock: 120,
    rating: 4.7,
    reviewCount: 95,
    images: ["https://images.unsplash.com/photo-1620331317312-74b88bf40907?w=600&auto=format&fit=crop&q=60"],
    tags: ["comb", "haircare"]
  },
  {
    productName: "Jade Roller",
    name: "Jade Roller",
    category: "tools",
    price: 30,
    lastPrice: 30,
    description: "Cooling jade stone roller to de-puff and soothe skin.",
    stock: 85,
    rating: 4.5,
    reviewCount: 130,
    benefits: ["soothing"],
    images: ["https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&auto=format&fit=crop&q=60"],
    tags: ["jade", "roller"]
  },
  {
    productName: "Silk Sleep Mask",
    name: "Silk Sleep Mask",
    category: "tools",
    price: 45,
    lastPrice: 45,
    description: "100% mulberry silk mask to protect the delicate eye area while sleeping.",
    stock: 90,
    rating: 4.9,
    reviewCount: 210,
    isNew: true,
    images: ["https://images.unsplash.com/photo-1581454553255-a4b5d25244bd?w=600&auto=format&fit=crop&q=60"],
    tags: ["silk", "sleep"]
  }
];

// Function to generate next product ID
async function getNextSequenceValue(sequenceName) {
  try {
    const sequenceDocument = await Counter.findOneAndUpdate(
      { _id: sequenceName },
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true }
    );
    return sequenceDocument.sequence_value;
  } catch (error) {
    console.error("Error getting sequence:", error);
    throw error;
  }
}

async function seedDatabase() {
  try {
    const mongoUrl = process.env.MONGO_DB_URI;
    await mongoose.connect(mongoUrl, {});
    console.log("Database connected for seeding...");

    // Optional: Clear existing products if you want a fresh start
    // await Product.deleteMany({});
    // console.log("Cleared existing products.");

    console.log(`Inserting ${sampleProducts.length} sample products...`);

    for (let i = 0; i < sampleProducts.length; i++) {
      const productData = sampleProducts[i];
      const sequenceValue = await getNextSequenceValue("productId");
      const productId = `PRD${String(sequenceValue).padStart(4, "0")}`;
      
      productData.productId = productId;
      
      const product = new Product(productData);
      await product.save();
      console.log(`Inserted: ${product.name} (${productId})`);
    }

    console.log("All products inserted successfully!");

    console.log("Starting embedding backfill for the new products...");
    await backfillEmbeddings();
    
    console.log("Database Seed & AI Embedding generation completely finished!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
