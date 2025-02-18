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

export function ChatContextProvider({ children }: { children: React.ReactNode }) {
    const { authState } = useContext(AuthContext);
    const [user_id, setUserId] = useState<string | null>(null);
    const [socket, setSocket] = useState<Socket | undefined>();
    const [presenceChannel, setPresenceChannel] = useState<any>();
    const [notificationChannel, setNotificationChannel] = useState<any>();

    async function connectToChatServerWebSocket() {
        const { deviceTokenId } = await ChatModelContext.getStoredTokens();
        const user_id = LocalStoragePersistence.getUserId();
        const jwtToken = LocalStoragePersistence.getJWT();
        const user_preferred_language = await ChatModelContext.getUserPreferredLanguage();
        setUserId(user_id);

        if (!jwtToken || !deviceTokenId || !user_preferred_language) {
            throw new Error("JWT or Device token not found");
        }

        const newSocket = new Socket("ws://localhost:4000/socket", {
            params: {
                token: jwtToken,
                device_unique_id: deviceTokenId,
                preferred_language: user_preferred_language,
            },
            transport: window.WebSocket,
        });

        newSocket.connect();
        setSocket(newSocket);

        const presenceChannel = newSocket.channel("presence:lobby", {});
        const notificationChannel = newSocket.channel(`notifications:${user_id}`, {});

        presenceChannel.join();
        notificationChannel.join();

        notificationChannel.on("pending_notification", ChatModelContext.handleIncomingNotification);
        notificationChannel.on("new_notification", ChatModelContext.handleIncomingNotification);

        setPresenceChannel(presenceChannel);
        setNotificationChannel(notificationChannel);

        // Retorna uma função de limpeza para desconectar o socket e os canais
        return () => {
            notificationChannel.off("pending_notification");
            notificationChannel.off("new_notification");
            presenceChannel.leave();
            notificationChannel.leave();
            newSocket.disconnect();
        };
    }

    useEffect(() => {
        if (authState.authenticated && !socket) {
            // Conecta ao socket apenas se autenticado e o socket ainda não foi criado
            connectToChatServerWebSocket()
                .catch((error) => console.error("Error connecting to socket:", error));
        }

        // Limpa o socket e os canais quando o componente é desmontado ou a autenticação muda
        return () => {
            if (socket) {
                socket.disconnect();
                setSocket(undefined);
            }
            if (presenceChannel) {
                presenceChannel.leave();
            }
            if (notificationChannel) {
                notificationChannel.leave();
            }
        };
    }, [authState.authenticated]); // Depende apenas do estado de autenticação

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