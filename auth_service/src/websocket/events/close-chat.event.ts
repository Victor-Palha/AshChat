import { Socket } from "socket.io";
import { IOServer } from "..";
import { ChatNotFoundError } from "../../domain/use-cases/errors/chat-not-found-error";
import { MongoChatRepository } from "../../persistence/repositories/mongo-chat-repository";

type CloseChatEventDTO = {
    chat_id: string;
};

export function closeChatEvent(socket: Socket, ioServer: IOServer) {
    socket.on("close-chat", async (data: CloseChatEventDTO) => {
        const userId = ioServer.verifyAuthByToken(socket.handshake.auth.token);
        const { chat_id } = data;

        try {
            const chatRepository = new MongoChatRepository();
            const chatExists = await chatRepository.findById(chat_id);

            if (!chatExists) {
                socket.emit("chat-not-found", { message: "O chat não existe." });
                return;
            }

            socket.leave(`chat_${chat_id}`);

            console.log(`Chat ${chat_id} fechado pelo usuário ${userId}.`);
            
        } catch (error) {
            if (error instanceof ChatNotFoundError) {
                console.error("Chat não encontrado:", error);
                socket.emit("chat-not-found", { message: "O chat não foi encontrado." });
            } else {
                console.error("Erro ao fechar o chat:", error);
                socket.emit("error", { message: "Não foi possível fechar o chat." });
            }
        }
    });
}
