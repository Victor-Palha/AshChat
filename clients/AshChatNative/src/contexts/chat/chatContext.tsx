import { Socket } from "phoenix";
import { createContext, useContext, useEffect, useState } from "react";
import { useMMKVString } from "react-native-mmkv";
import { ChatModelContext } from "./chatModelContext";
import { AuthContext } from "../auth/authContext";

type ChatProps = {
    socket: Socket | undefined;
    user_id: string | undefined;
};

export const ChatContext = createContext<ChatProps>({} as ChatProps);

export function ChatContextProvider({ children }: { children: React.ReactNode }){
    const {authState} = useContext(AuthContext);
    const [user_id] = useMMKVString("ashchat.user_id");
    const [jwtToken] = useMMKVString("ashchat.jwt");
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
            transport: global.WebSocket,
        });

        newSocket.connect();
        setSocket(newSocket);
        return newSocket;
    }

    useEffect(() => {
        if (!user_id || socket) return;
    
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
        user_id
    };

    return (
        <ChatContext.Provider value={values}>
            {children}
        </ChatContext.Provider>
    );
}