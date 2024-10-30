import { Socket } from "socket.io";
import { IOServer } from "..";
import { InMemoryChatRepository } from "../../domain/repositories/in-memory/in-memory-chat-repository";

type JoinChatEventDTO = {
    userId: string;
    chatId: string;
};

export function joinChatEvent(socket: Socket, ioServer: IOServer) {
    socket.on("join-chat", async (data: JoinChatEventDTO) => {
        const { chatId } = data;

        try {
            const chatRepository = new InMemoryChatRepository();

            const chatExists = await chatRepository.findById(chatId);
            if (!chatExists) {
                socket.emit("chat-not-found", { message: "O chat não existe. Envie uma mensagem para criá-lo." });
                return;
            }

            socket.join(`chat_${chatId}`);
        } catch (error) {
            console.error("Erro ao entrar no chat:", error);
            socket.emit("error", { message: "Não foi possível entrar no chat." });
        }
    });
}
