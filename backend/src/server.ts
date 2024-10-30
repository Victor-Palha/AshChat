import { app, IO } from "./app";
import { env } from "./config/env";
import { IOServer } from "./websocket";

function main() {
    const PORT = env.PORT;

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        const WS = new IOServer(IO);
        WS.initialize();
    });
}

main();