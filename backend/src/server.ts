import { app, IO } from "./app";
import { env } from "./config/env";
import { connectToDatabase } from "./config/mongo";
import { IOServer } from "./websocket";

async function main() {
    const PORT = env.PORT;
    const AMQP_URI = env.AMQP_URI;
    const MONGODB_URI = env.MONGODB_URI
    
    try {
        await connectToDatabase(MONGODB_URI);

    } catch (error) {
        console.log("Error to inicialize dependencies")
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        const WS = new IOServer(IO);
        WS.initialize();
    });
}

main();