import mongoose from "mongoose";
import dotenv from "dotenv";
import Review from "./models/Review.js";

dotenv.config();

const mongoUrl = process.env.MONGO_DB_URI;
const targetProductId = "6a72c497a82369e39aac5c36";

const testReviews = [
  {
    productId: targetProductId,
    email: "customer1@eleve.com",
    userName: "Alice Smith",
    review: "This perfume smells absolutely incredible! The rich oud scent is deep and luxurious, and I’ve received so many compliments since I started wearing it. The gold-trimmed bottle looks gorgeous on my dresser. Highly recommend!",
    rating: 5,
    status: "approved",
    sentiment: "positive",
    flagged: false,
    flagReason: "",
    hidden: false
  },
  {
    productId: targetProductId,
    email: "customer2@eleve.com",
    userName: "Brian O'Conner",
    review: "A beautiful, high-quality fragrance. The packaging feels premium and the scent profile is elegant. It lasts a solid 6-8 hours on my skin. The only minor drawback is the spray nozzle is a bit stiff to press, but the scent itself is worth it.",
    rating: 4,
    status: "approved",
    sentiment: "positive",
    flagged: false,
    flagReason: "",
    hidden: false
  },
  {
    productId: targetProductId,
    email: "customer3@eleve.com",
    userName: "Chloe Davis",
    review: "The scent itself is nice and clean, but unfortunately, it doesn’t seem to last very long on my skin—it fades away after just two hours. For this luxury price point, I was expecting much better longevity. It's just okay.",
    rating: 3,
    status: "approved",
    sentiment: "neutral",
    flagged: false,
    flagReason: "",
    hidden: false
  },
  {
    productId: targetProductId,
    email: "customer4@eleve.com",
    userName: "Daniel Carter",
    review: "This fragrance is way too overpowering and heavy for me, it instantly gave me a headache. It smells quite synthetic compared to the sample I tried in-store. Also, the pump mechanism leaks slightly when sprayed. Disappointed.",
    rating: 2,
    status: "approved",
    sentiment: "negative",
    flagged: false,
    flagReason: "",
    hidden: false
  },
  {
    productId: targetProductId,
    email: "customer5@eleve.com",
    userName: "Emma Watson",
    review: "Bought this as an anniversary gift for my husband and he absolutely loves it. The opening notes are warm and woody, and it dries down to a nice subtle finish. The presentation box it came in was stunning.",
    rating: 5,
    status: "approved",
    sentiment: "positive",
    flagged: false,
    flagReason: "",
    hidden: false
  },
  {
    productId: targetProductId,
    email: "spammer99@eleve.com",
    userName: "SpamBot",
    review: "Hey everyone!!! Click this link right now for FREE GIFT CARDS AND CASH: http://fake-deals-spam.ru/offers. No catch, 100% working deal! Don't miss out on this free money trick!",
    rating: 1,
    status: "flagged",
    sentiment: "negative",
    flagged: true,
    flagReason: "Auto-flagged: contains spam links and irrelevant advertisement",
    hidden: false
  }
];

mongoose.connect(mongoUrl, {})
  .then(async () => {
    console.log("Connected to MongoDB database.");
    
    // We clear any existing reviews on this product from these test emails to avoid unique index conflicts
    const emails = testReviews.map(r => r.email);
    console.log("Cleaning up existing test reviews for these emails...");
    await Review.deleteMany({ productId: targetProductId, email: { $in: emails } });

    console.log("Seeding new reviews...");
    const inserted = await Review.insertMany(testReviews);
    console.log(`Successfully seeded ${inserted.length} reviews!`);
    
    process.exit(0);
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });
