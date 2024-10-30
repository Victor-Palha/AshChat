// src/config/database.ts
import mongoose from "mongoose";
import { env } from "./env";

export const connectToDatabase = async () => {
    try {
        await mongoose.connect(env.MONGODB_URI as string);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Could not connect to MongoDB", error);
        process.exit(1);
    }
};
