import { Socket } from "phoenix";
import { createContext, useContext, useEffect, useState } from "react";
import { ChatModelContext } from "./chatModelContext";
import { AuthContext } from "../auth/authContext";
import LocalStoragePersistence from "../../lib/local-storage-persistence";

type ChatProps = {
    socket: Socket | undefined;
    user_id: string | null;
};

export const ChatContext = createContext<ChatProps>({} as ChatProps);

export function ChatContextProvider({ children }: { children: React.ReactNode }){
    const {authState} = useContext(AuthContext);
    const [user_id, setUserId] = useState<string | null>(null);
    const [jwtToken, setJwtToken] = useState<string | null>(null);
    const [socket, setSocket] = useState<Socket | undefined>();
    const [presenceChannel, setPresenceChannel] = useState<any>();
    const [notificationChannel, setNotificationChannel] = useState<any>();

    async function connectToChatServerWebSocket(jwtToken: string | undefined) {
        const {deviceTokenId} = await ChatModelContext.getStoredTokens();
        const user_preferred_language = await ChatModelContext.getUserPreferredLanguage();
        if (!jwtToken || !deviceTokenId || !user_preferred_language) {
            throw new Error("JWT or Device token not found");
        }

        const newSocket = new Socket("ws://localhost:4000/socket", {
            params: {
                token: jwtToken,
                device_unique_id: deviceTokenId,
                preferred_language: user_preferred_language
            },
            transport: window.WebSocket,
        });

        newSocket.connect();
        setSocket(newSocket);
        // console.log("Connected to chat server");
        // console.log("Socket", newSocket);
        return newSocket;
    }

    useEffect(() => {
        const user_id = LocalStoragePersistence.getUserId();
        const jwtToken = LocalStoragePersistence.getJWT();
        setUserId(user_id);
        setJwtToken(jwtToken);
        if (!user_id || socket || !jwtToken) return;
    
        connectToChatServerWebSocket(jwtToken)
            .then((newSocket) => {
                const presenceChannel = newSocket.channel("presence:lobby", {});
                const notificationChannel = newSocket.channel(`notifications:${user_id}`, {});
                setPresenceChannel(presenceChannel);
                setNotificationChannel(notificationChannel);
    
                presenceChannel.join();
                notificationChannel.join();

                notificationChannel.off("pending_notification");
                notificationChannel.off("new_notification");
    
                notificationChannel.on("pending_notification", ChatModelContext.handleIncomingNotification);
                notificationChannel.on("new_notification", ChatModelContext.handleIncomingNotification);
    
                return () => {
                    notificationChannel.off("pending_notification");
                    notificationChannel.off("new_notification");
                };
            })
            .catch((error) => console.error("Error connecting to socket:", error));
    }, [user_id, jwtToken, authState]);

    useEffect(() => {
        if(authState.authenticated === false && socket) {
            socket.disconnect();
            notificationChannel.leave();
            presenceChannel.leave();
            setSocket(undefined)
        }
    }, [authState])

    const values: ChatProps = {
        socket,
        user_id: user_id,
    };

    return (
        <ChatContext.Provider value={values}>
            {children}
        </ChatContext.Provider>
    );
}