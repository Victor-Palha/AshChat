import { app, IO } from "./app";
import { env } from "./config/env";
import { connectToDatabase } from "./config/mongo";
import { IOServer } from "./websocket";

/**
 * The main function initializes the server and its dependencies.
 *
 * It retrieves the necessary environment variables for the server port and MongoDB URI,
 * attempts to connect to the MongoDB database, and starts the server on the specified port.
 *
 * If the database connection fails, the process exits with a status code of 1.
 *
 * Once the server is running, it initializes the WebSocket server.
 *
 * @async
 * @function main
 * @returns {Promise<void>} A promise that resolves when the server is successfully started.
 */
async function main() {
    const PORT = env.PORT;
    const MONGODB_URI = env.MONGODB_URI;
    
    try {
        console.log("Connecting to the database...");
        await connectToDatabase(MONGODB_URI);
        console.log("Connected to the database successfully.");
    } catch (error) {
        console.error("Error initializing dependencies:", error);
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        const WS = new IOServer(IO);
        WS.initialize();
        console.log("WebSocket server initialized.");
    });
}

main();
