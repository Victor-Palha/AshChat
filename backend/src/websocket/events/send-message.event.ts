import { Socket } from "socket.io";
import { IOServer } from "..";
import { ChatNotFoundError } from "../../domain/use-cases/errors/chat-not-found-error";
import { sendNewMessageFactory } from "../../domain/factories/send-new-message.factory";
import { sendNotificationFactory } from "../../domain/factories/send-notification.factory";
import { findReceiverIdFactory } from "../../domain/factories/find-receiver-id.factory";

type SendMessageEventDTO = {
    senderId: string;
    chatID: string;
    content: string;
};

export function sendMessageEvent(socket: Socket, ioServer: IOServer) {
    socket.on("send-message", async (data: SendMessageEventDTO) => {
        const senderId = ioServer.verifyAuthByToken(socket.handshake.auth.token);
        const { chatID, content } = data;

        try {
            const sendMessageUseCase = sendNewMessageFactory();

            const message = await sendMessageUseCase.execute({ senderId, chatID, content });

            const usersInRoom = await ioServer._io.in(`chat_${chatID}`).fetchSockets();
            const receiverAreInRoom = usersInRoom.length > 1;

            if (receiverAreInRoom) {
                ioServer._io.to(`chat_${chatID}`).emit("receive-message", {
                    chatID,
                    senderId,
                    content,
                    timestamp: new Date().toISOString(),
                });
                console.log(`Mensagem enviada no chat ${chatID} pelo usuário ${senderId}`);

            } else {
                const sendNotificationUseCase = sendNotificationFactory();
                const findReceiverIdUseCase = findReceiverIdFactory()

                const receiverId = await findReceiverIdUseCase.execute({
                    chatId: chatID,
                    senderId
                })

                if(!receiverId){
                    return
                }

                await sendNotificationUseCase.execute({
                    receiverId: receiverId,
                    chatId: chatID, 
                    messageId: message.id.getValue
                });

                console.log(`Notificação enviada para o usuário ${receiverId} sobre a mensagem no chat ${chatID}.`);

            }
            
        } catch (error) {
            if (error instanceof ChatNotFoundError) {
                socket.emit("error", { message: "Chat não encontrado. Verifique o ID do chat." });
            } else {
                console.error("Erro ao enviar mensagem:", error);
                socket.emit("error", { message: "Não foi possível enviar a mensagem." });
            }
        }
    });
}
