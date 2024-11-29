import mongoose from "mongoose";

/**
 * Connects to the MongoDB database using the provided URI.
 *
 * @param {string} MONGODB_URI - The URI of the MongoDB database to connect to.
 * @returns {Promise<void>} A promise that resolves when the connection is successful.
 * @throws Will throw an error if the connection to MongoDB fails.
 */
export async function connectToDatabase(MONGODB_URI: string): Promise<void> {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Could not connect to MongoDB", error);
        process.exit(1);
    }
};
