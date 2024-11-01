import mongoose from "mongoose";

export async function connectToDatabase(MONGODB_URI: string): Promise<void> {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Could not connect to MongoDB", error);
        process.exit(1);
    }
};
