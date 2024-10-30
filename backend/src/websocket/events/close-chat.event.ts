import { Socket } from "socket.io";
import { IOServer } from "..";
import { ChatNotFoundError } from "../../domain/use-cases/errors/chat-not-found-error";
import { InMemoryChatRepository } from "../../domain/repositories/in-memory/in-memory-chat-repository";

type CloseChatEventDTO = {
    userId: string;
    chatId: string;
};

export function closeChatEvent(socket: Socket, ioServer: IOServer) {
    socket.on("close-chat", async (data: CloseChatEventDTO) => {
        const { userId, chatId } = data;

        try {
            const chatRepository = new InMemoryChatRepository();
            const chatExists = await chatRepository.findById(chatId);

            if (!chatExists) {
                socket.emit("chat-not-found", { message: "O chat não existe." });
                return;
            }

            socket.leave(`chat_${chatId}`);

            console.log(`Chat ${chatId} fechado pelo usuário ${userId}.`);
            
        } catch (error) {
            if (error instanceof ChatNotFoundError) {
                socket.emit("chat-not-found", { message: "O chat não foi encontrado." });
            } else {
                console.error("Erro ao fechar o chat:", error);
                socket.emit("error", { message: "Não foi possível fechar o chat." });
            }
        }
    });
}
