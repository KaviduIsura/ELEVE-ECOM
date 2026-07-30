import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoUrl = process.env.MONGO_DB_URI;

async function getUsers() {
  try {
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB.");
    
    const db = mongoose.connection.db;
    const users = await db.collection("users").find({}).toArray();
    
    console.log("--- USERS FOUND ---");
    users.forEach(u => {
      console.log(`Type: ${u.type} | Email: ${u.email} | Name: ${u.firstName} ${u.lastName}`);
    });
    
    mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

getUsers();
