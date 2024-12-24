import React, { createContext, useContext, useEffect, useState } from "react";
import { MMKVStorage } from "../persistence/MMKVStorage";
import { useMMKVString } from "react-native-mmkv";
import SecureStoragePersistence from "../persistence/SecureStorage";
import { Socket, Channel } from "phoenix";
import { PhoenixAPIClient } from "../api/phoenix-api-client";

type SocketProps = {
    socket: Socket | undefined;
    mmkvStorage: MMKVStorage;
    user_id: string | undefined;
    setUserProfile(): Promise<void>;
};

type Notification = {
    chat_id: string;
    sender_id: string;
    content: string;
    timestamp: string;
    isNotification?: boolean;
};

export const SocketContext = createContext<SocketProps>({} as SocketProps);

const mmkvStorage = new MMKVStorage();

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const [user_id] = useMMKVString("ashchat.user_id");
    const [jwtToken] = useMMKVString("ashchat.jwt");
    const [socket, setSocket] = useState<Socket | undefined>();
    const [, setChannel] = useState<Channel | null>(null);

    async function setUserProfile() {
        const api = PhoenixAPIClient
        const mmkvStorage = new MMKVStorage()
        const token = await SecureStoragePersistence.getJWT()
        const device_token = await SecureStoragePersistence.getUniqueDeviceId()
        if(!token || !device_token) return
        api.setTokenAuth(token)
        api.setHeader("device_token", device_token)
        try {
            const response = await api.server.get("/user")
            if(response.status == 200){
                const {nickname, description, photo_url, preferred_language, tag_user_id} = response.data.user
                mmkvStorage.setUserProfile({
                    nickname,
                    description,
                    photo_url,
                    preferred_language,
                    tag_user_id
                })
            }
        } catch (error) {
            console.log("socketContext error")
            console.log(error)
        }
    }

    async function connectSocket(jwtToken: string | undefined) {
        await setUserProfile();
        const deviceToken = await SecureStoragePersistence.getUniqueDeviceId();
        const userProfile = mmkvStorage.getUserProfile();
        if (!jwtToken || !deviceToken || !userProfile) {
            throw new Error("JWT or Device token not found");
        }

        const newSocket = new Socket("ws://localhost:4000/socket", {
            params: {
                token: jwtToken,
                device_unique_id: deviceToken,
                preferred_language: userProfile.preferred_language
            },
            transport: global.WebSocket,
        });

        newSocket.connect();
        setSocket(newSocket);
        return newSocket;
    }

    useEffect(() => {
        if (!user_id || socket) return;
    
        connectSocket(jwtToken)
            .then((newSocket) => {
                const presenceChannel = newSocket.channel("presence:lobby", {});
                const notificationChannel = newSocket.channel(`notifications:${user_id}`, {});
    
                presenceChannel.join();
                notificationChannel.join();
    
                setChannel(notificationChannel);
    
                function handleNotification(notification: Notification) {
                    const { chat_id, sender_id, content, timestamp, isNotification = true } = notification;
                    mmkvStorage.addMessage({
                        chat_id,
                        content,
                        sender_id,
                        timestamp,
                        isNotification,
                    });
                }

                notificationChannel.off("pending_notification");
                notificationChannel.off("new_notification");
    
                notificationChannel.on("pending_notification", handleNotification);
                notificationChannel.on("new_notification", handleNotification);
    
                return () => {
                    notificationChannel.off("pending_notification");
                    notificationChannel.off("new_notification");
                    notificationChannel.leave(); 
                };
            })
            .catch((error) => console.error("Error connecting to socket:", error));
    }, [user_id, jwtToken]);

    const values = {
        socket,
        mmkvStorage,
        user_id,
        setUserProfile,
    };

    return (
        <SocketContext.Provider value={values}>
            {children}
        </SocketContext.Provider>
    );
}
