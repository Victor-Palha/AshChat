import React, { createContext, useEffect, useState } from "react";
import { MMKVStorage } from "../persistence/MMKVStorage";
import { useMMKVString } from "react-native-mmkv";
import SecureStoragePersistence from "../persistence/SecureStorage";
import { Socket } from "phoenix";

type SocketProps = {
    socket: Socket | undefined;
    mmkvStorage: MMKVStorage;
    user_id: string | undefined;
};

type Notification = {
    chat_id: string;
    sender_id: string;
    content: string;
    timestamp: string;
};

export const SocketContext = createContext<SocketProps>({} as SocketProps);

const mmkvStorage = new MMKVStorage();

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const [user_id] = useMMKVString("ashchat.user_id");
    const [socket, setSocket] = useState<Socket | undefined>();

    async function setUserId() {
        const userId = await SecureStoragePersistence.getUserId();
        if (!userId) {
            return;
        }
        mmkvStorage.setUserId(userId);
        return userId;
    }

    useEffect(() => {
        setUserId();
    }, []);

    async function connectSocket() {
        const jwtToken = await SecureStoragePersistence.getJWT();
        const deviceToken = await SecureStoragePersistence.getUniqueDeviceId();

        if (!jwtToken || !deviceToken) {
            throw new Error("JWT or Device token not found");
        }

        const newSocket = new Socket("ws://localhost:4000/socket", {
            params: {
                token: jwtToken,
                device_unique_id: deviceToken,
            },
            transport: global.WebSocket,
        });

        newSocket.connect();
        setSocket(newSocket);
        return newSocket;
    }

    useEffect(() => {
        if (!user_id || socket) return; // Só tenta conectar se user_id existir e socket não estiver conectado

        connectSocket()
            .then((newSocket) => {
                const channel = newSocket.channel(`notifications:${user_id}`, {});
                channel.join();

                const handlePendingNotification = (notification: Notification) => {
                    mmkvStorage.addMessage(notification);
                };

                channel.on("pending_notification", handlePendingNotification);
                channel.on("new_notification", handlePendingNotification);
            })
            .catch((error) => console.error("Error connecting to socket:", error));
    }, [user_id]); // Removido `socket` das dependências para evitar loop

    const values = {
        socket,
        mmkvStorage,
        user_id,
    };

    return (
        <SocketContext.Provider value={values}>
            {children}
        </SocketContext.Provider>
    );
}
