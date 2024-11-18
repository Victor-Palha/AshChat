import { Socket } from "socket.io";
import { IOServer } from "..";
import { createNewChatFactory } from "../../domain/factories/create-new-chat.factory";
import { sendNotificationFactory } from "../../domain/factories/send-notification.factory";
import { findUserByIdFactory } from "../../domain/factories/find-user-by-id.factory";

type CreateChatEventDTO = {
    receiverId: string;
    content: string;
};

export function createChatEvent(socket: Socket, ioServer: IOServer) {
    socket.on("create-chat", async (data: CreateChatEventDTO) => {
        const senderId = ioServer.verifyAuthByToken(socket.handshake.auth.token);
        const { receiverId } = data;

        if(!receiverId){
            socket.emit("error", { message: "Dados insuficientes para criar o chat." });
            return;
        }
        
        try {
            const createNewChatUseCase = createNewChatFactory();
            const findUserByIdUseCase = findUserByIdFactory();
            const {nickname} = await findUserByIdUseCase.execute(receiverId);
            
            const {chat} = await createNewChatUseCase.execute({
                senderId,
                receiverId,
            });

            socket.emit("chat-created", { 
                chat_id: chat.id.getValue,
                messages: [],
                nickname

             });
        } catch (error) {
            console.error("Erro ao criar o chat:", error);
            socket.emit("create-chat-error", { message: "Não foi possível criar o chat." });
        }
    });
}
