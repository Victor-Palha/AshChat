// src/config/database.ts
import mongoose from "mongoose";
import { env } from "./env";

export async function connectToDatabase(MONGODB_URI: string): Promise<void> {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Could not connect to MongoDB", error);
        process.exit(1);
    }
};
