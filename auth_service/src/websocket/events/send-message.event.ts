import { Socket } from "socket.io";
import { IOServer } from "..";
import { ChatNotFoundError } from "../../domain/use-cases/errors/chat-not-found-error";
import { sendNewMessageFactory } from "../../domain/factories/send-new-message.factory";
import { findReceiverIdFactory } from "../../domain/factories/find-receiver-id.factory";
import { MessageStatus } from "../../domain/entities/message";
import { Notification } from "../../domain/entities/notification";
import { randomUUID } from "crypto";

type SendMessageEventDTO = {
    chat_id: string;
    content: string;
    message_id: string;
};

export function sendMessageEvent(socket: Socket, ioServer: IOServer) {
    socket.on("send-message", async (data: SendMessageEventDTO) => {
        const senderId = ioServer.verifyAuthByToken(socket.handshake.auth.token);
        const { chat_id, content, message_id } = data;

        try {
            const sendMessageUseCase = sendNewMessageFactory();

            const message = await sendMessageUseCase.execute({ senderId, chatID: chat_id, content });

            const usersInRoom = await ioServer._io.in(`chat_${chat_id}`).fetchSockets();
            const receiverAreInRoom = usersInRoom.length > 1;

            if (receiverAreInRoom) {
                ioServer._io.to(`chat_${chat_id}`).emit("receive-message", {
                    chat_id,
                    sender_id: senderId,
                    content,
                });

                socket.emit("message-sent", {
                    chat_id,
                    status: MessageStatus.SENT,
                    message_id: message_id,
                })

            } else {
                const findReceiverIdUseCase = findReceiverIdFactory()

                const receiverId = await findReceiverIdUseCase.execute({
                    chatId: chat_id,
                    senderId
                })

                if(!receiverId){
                    return
                }
                console.log(receiverId)
                const notification = new Notification({
                    notification_id: null,
                    chat_id,
                    message: message.toNotification()
                })
                

                console.log(notification)

                ioServer.pubSubNotification.addNotification({
                    receiver_id: receiverId,
                    notification
                })

                ioServer.sendNotifications(receiverId)
                console.log(`Notificação enviada para o usuário ${receiverId} sobre a mensagem no chat ${chat_id}.`);
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
