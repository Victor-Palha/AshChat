import { Channel, Socket } from "phoenix";
import WS from "ws";
import SecureStoragePersistence from "../persistence/SecureStorage";
import { MMKVStorage } from "../persistence/MMKVStorage";
export class IOClient {
    private socket?: Socket;

    constructor() {}

    public async connect() {
        const jwtToken = await SecureStoragePersistence.getJWT();
        const deviceToken = await SecureStoragePersistence.getUniqueDeviceId();
        const userProfile = new MMKVStorage().getUserProfile()
        if (!jwtToken || !deviceToken || !userProfile) {
            throw new Error("JWT or Device token not found");
        }

        this.socket = new Socket("ws://10.0.2.2:4000/socket", {
            params: {
                token: jwtToken,
                device_unique_id: deviceToken,
                preferred_language: userProfile.preferred_language
            },
            transport: WS,
        });

        this.socket.onError(() => {
            console.error("WebSocket connection error");
        });

        this.socket.onClose(() => {
            console.log("WebSocket disconnected");
        });

        this.socket.connect(); // Apenas uma chamada necessária
    }

    public getSocket(): Socket {
        if (!this.socket) {
            throw new Error("Socket not connected");
        }
        return this.socket;
    }

    public chatChannel(chat_id: string): Channel {
        if (!this.socket) {
            throw new Error("Socket not connected");
        }
        const channel = this.socket.channel(`chat:${chat_id}`, {}); // Corrigido o uso de template literal
        console.log("Chat channel created:", channel);
        return channel;
    }

    public notificationsChannel(user_id: string): Channel {
        if (!this.socket) {
            throw new Error("Socket not connected");
        }
        const channel = this.socket.channel(`notifications:${user_id}`, {});
        console.log("Notifications channel created:", channel);
        return channel;
    }
}
