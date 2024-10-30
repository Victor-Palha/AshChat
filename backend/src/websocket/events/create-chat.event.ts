import { Socket } from "socket.io";
import { IOServer } from "..";
import { createNewChatFactory } from "../../domain/factories/create-new-chat.factory";
import { sendNotificationFactory } from "../../domain/factories/send-notification.factory";

type CreateChatEventDTO = {
    senderId: string;
    receiverId: string;
    content: string;
};

export function createChatEvent(socket: Socket, ioServer: IOServer) {
    socket.on("create-chat", async (data: CreateChatEventDTO) => {
        const { senderId, receiverId, content } = data;

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

            // Notificar o usuário receptor se ele não estiver na sala
            const usersInRoom = await ioServer._io.in(`chat_${chat.id.getValue}`).fetchSockets();
            const receiverIsInRoom = usersInRoom.some(user => user.id === receiverId);

            if (!receiverIsInRoom) {
                const sendNotificationUseCase = sendNotificationFactory();
                await sendNotificationUseCase.execute({
                    receiverId,
                    chatId: chat.id.getValue,
                    messageId: messageId.id.getValue
                });
                console.log(`Notificação enviada para o usuário ${receiverId} sobre o novo chat ${chat.id.getValue}.`);
            } else {
                // Se o receptor estiver na sala, notificar todos os usuários na sala
                ioServer._io.to(`chat_${chat.id.getValue}`).emit("chat-created", { chatId: chat.id.getValue, senderId, content });
            }

            console.log(`Chat ${chat.id.getValue} criado entre ${senderId} e ${receiverId}`);
        } catch (error) {
            console.error("Erro ao criar o chat:", error);
            socket.emit("error", { message: "Não foi possível criar o chat." });
        }
    });
}
