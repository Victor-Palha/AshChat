import { Socket } from "socket.io";
import { IOServer } from "..";
import { createNewChatFactory } from "../../domain/factories/create-new-chat.factory";
import { sendNotificationFactory } from "../../domain/factories/send-notification.factory";

type CreateChatEventDTO = {
    receiverId: string;
    content: string;
};

export function createChatEvent(socket: Socket, ioServer: IOServer) {
    socket.on("create-chat", async (data: CreateChatEventDTO) => {
        const senderId = ioServer.verifyAuthByToken(socket.handshake.auth.token);
        const { receiverId, content } = data;

        if(!receiverId || !content){
            socket.emit("error", { message: "Dados insuficientes para criar o chat." });
            return;
        }
        
        try {
            const createNewChatUseCase = createNewChatFactory();

            // Criar um novo chat
            const { chat } = await createNewChatUseCase.execute({
                senderId,
                receiverId,
                content,
            });

            const messageId = chat.messages[0]

            // Entrar na sala do chat
            socket.join(`chat_${chat.id.getValue}`);

            const sendNotificationUseCase = sendNotificationFactory();
            await sendNotificationUseCase.execute({
                receiverId,
                chatId: chat.id.getValue,
                messageId: messageId.id.getValue
            });

        } catch (error) {
            console.error("Erro ao criar o chat:", error);
            socket.emit("error", { message: "Não foi possível criar o chat." });
        }
    });
}
