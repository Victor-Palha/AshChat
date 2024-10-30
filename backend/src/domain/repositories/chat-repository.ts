import { Chat } from "../entities/chat";
import { Message } from "../entities/message";
import { CreateNewChatUseCaseDTO } from "../use-cases/create-new-chat-use-case";

export interface CreateChatDTO extends CreateNewChatUseCaseDTO {
    message: Message,
    sameLanguage: boolean
}

export abstract class ChatRepository {
    abstract createChat(data: CreateChatDTO): Promise<Chat>
    abstract findById(id: string): Promise<Chat | null>
    abstract sendMessage(chatID: string, message: Message): Promise<Message>
    abstract findMessageById(chatID: string, messageID: string): Promise<Message | null>
    abstract changeMessageStatus(chatID: string, messageID: string, status: string): Promise<void>
    abstract findReceiverId(chatID: string, senderId: string): Promise<string | null>
}