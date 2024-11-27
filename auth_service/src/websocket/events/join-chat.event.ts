import { Socket } from "socket.io";
import { IOServer as ioServer } from "..";
import { MongoChatRepository } from "../../persistence/repositories/mongo-chat-repository";

type JoinChatEventDTO = {
    userId: string;
    chat_id: string;
};

export function joinChatEvent(socket: Socket, ioServer: ioServer) {
    socket.on("join-chat", async (data: JoinChatEventDTO) => {
        const { chat_id } = data;
        try {
            const chatRepository = new MongoChatRepository();

            const chatExists = await chatRepository.findById(chat_id);
            if (!chatExists) {
                socket.emit("chat-not-found", { message: "O chat não existe. Envie uma mensagem para criá-lo." });
                return;
            }

            socket.join(`chat_${chat_id}`);
        } catch (error) {
            console.error("Erro ao entrar no chat:", error);
            socket.emit("error", { message: "Não foi possível entrar no chat." });
        }
    });
}
