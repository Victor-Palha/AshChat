import {io, Socket} from "socket.io-client";
import SecureStoragePersistence from "../persistence/SecureStorage";

export class IOClient {
    public socket: Socket = io("http://localhost:3005", {
        autoConnect: false,
    });

    constructor() {}

    public async connect() {
        const jwtToken = await SecureStoragePersistence.getJWT();
        const deviceToken = await SecureStoragePersistence.getUniqueDeviceId();
        if(!jwtToken || !deviceToken) {
            throw new Error("JWT or Device token not found");
        }
        this.socket.auth = {
            token: jwtToken,
            device_token: deviceToken
        }
        this.socket.connect();
    }
}