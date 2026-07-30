import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const mongoUrl = process.env.MONGO_DB_URI;

async function resetPasswords() {
  try {
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB...");
    
    const db = mongoose.connection.db;
    
    // The new password we will set
    const newPasswordRaw = "123456";
    const hashedPassword = bcrypt.hashSync(newPasswordRaw, 10);
    
    // Update Admin
    const adminResult = await db.collection("users").updateOne(
      { email: "admin@gmail.com" },
      { $set: { password: hashedPassword } }
    );
    console.log(`Admin reset: ${adminResult.modifiedCount} modified.`);
    
    // Update Customer
    const customerResult = await db.collection("users").updateOne(
      { email: "kavidu100@example.com" },
      { $set: { password: hashedPassword } }
    );
    console.log(`Customer reset: ${customerResult.modifiedCount} modified.`);
    
    console.log("Passwords have been successfully reset to: 123456");
    mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

resetPasswords();
