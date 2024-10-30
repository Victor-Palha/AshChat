
import { ChatModel } from "../models/chat.model";
import { Chat } from "../../domain/entities/chat";
import { Message, MessageStatus } from "../../domain/entities/message"; 
import { ChatRepository, CreateChatDTO } from "../../domain/repositories/chat-repository";
import { ChatMapper } from "../mappers/chat-mapper";
import { MessageMapper } from "../mappers/message-mapper";

export class MongoChatRepository implements ChatRepository {

    async createChat(data: CreateChatDTO){
        const chat = new Chat({
            usersID: [data.senderId, data.receiverId],
            messages: [data.message],
            sameLanguage: data.sameLanguage
        });

        const chatDocument = await ChatModel.create(chat); 
        return ChatMapper.toDomain(chatDocument);
    }

    async findById(id: string){
        const chatDocument = await ChatModel.findById(id).exec();
        return chatDocument ? ChatMapper.toDomain(chatDocument) : null;
    }

    async sendMessage(chatID: string, message: Message){
        const chat = await ChatModel.findById(chatID).exec();

        if (chat) {
            chat.messages.push({
                ...message,
                id: message.id.getValue,
                senderId: message.senderId.getValue
            });
            await chat.save();

        }
        
        return message;
    }

    async findMessageById(chatID: string, messageID: string): Promise<Message | null> {
        const chat = await ChatModel.findById(chatID).exec();

        if (chat) {
            const message = chat.messages.find(msg => msg.id === messageID);
            if(message){
                return MessageMapper.toDomain(message)
            }
        }
        return null;
    }

    async changeMessageStatus(chatID: string, messageID: string, status: MessageStatus): Promise<void> {
        const chat = await ChatModel.findById(chatID).exec();

        if (chat) {
            const message = chat.messages.find(msg => msg.id === messageID);

            if (message) {
                message.status = status;
                await chat.save();
            }
        }
    }

    async findReceiverId(chatID: string, senderId: string): Promise<string | null> {
        const chat = await ChatModel.findById(chatID).exec();

        if (chat) {
            return chat.usersID.find(userID => userID !== senderId) || null;
        }
        return null;
    }
}
