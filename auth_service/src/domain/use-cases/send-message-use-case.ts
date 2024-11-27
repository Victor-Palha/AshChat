import { Message, MessageStatus } from "../entities/message";
import { ChatRepository } from "../repositories/chat-repository";
import { ChatNotFoundError } from "./errors/chat-not-found-error";

type SendMessageDTO = {
    senderId: string;
    chatID: string;
    content: string;
}

export class SendMessageUseCase {
    constructor(
        private chatRepository: ChatRepository
    ){}

    async execute({senderId, chatID, content}: SendMessageDTO) {
        const chat = await this.chatRepository.findById(chatID);

        if (!chat) {
            throw new ChatNotFoundError();
        }

        const message: Message = new Message({
            senderId,
            content,
            status: MessageStatus.SENT,
            timestamp: new Date().toISOString(),
            translatedContent: "something"
        })

        return await this.chatRepository.sendMessage(chatID, message);
    }
}