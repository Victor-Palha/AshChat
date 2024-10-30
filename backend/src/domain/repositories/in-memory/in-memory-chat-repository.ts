import { Chat } from "../../entities/chat";
import { Message, MessageStatus } from "../../entities/message";
import { ChatRepository, CreateChatDTO } from "../chat-repository";

export class InMemoryChatRepository implements ChatRepository {

    private chats: Chat[] = [];

    async createChat(data: CreateChatDTO) {
        const chat = new Chat({
            usersID: [data.senderId, data.receiverId],
            messages: [data.message]
        });

        this.chats.push(chat);

        return chat;
    }

    async findById(id: string) {
        return this.chats.find(chat => chat.id.getValue === id) || null;
    }

    async sendMessage(chatID: string, message: Message) {
        const chat = this.chats.find(chat => chat.id.getValue === chatID);

        if (chat) {
            chat.messages.push(message);
        }

        return message
    }

    async findMessageById(chatID: string, messageID: string): Promise<Message | null> {
        const chat = this.chats.find(chat => chat.id.getValue === chatID);

        if (chat) {
            return chat.messages.find(message => message.id.getValue === messageID) || null;
        }

        return null;
    }

    async changeMessageStatus(chatID: string, messageID: string, status: MessageStatus) {
        const chat = this.chats.find(chat => chat.id.getValue === chatID);

        if (chat) {
            const message = chat.messages.find(message => message.id.getValue === messageID);

            if (message) {
                message.status = status;
            }
        }
    }

    async findReceiverId(chatID: string, senderId: string): Promise<string | null> {
        const chat = this.chats.find(chat => chat.id.getValue === chatID);

        if (chat) {
            return chat.usersID.find(userID => userID !== senderId) || '';
        }

        return null
    }
}