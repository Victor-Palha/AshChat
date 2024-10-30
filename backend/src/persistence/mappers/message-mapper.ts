import { Message } from "../../domain/entities/message";
import { Message as MongoMessage } from "../models/chat.model";

export class MessageMapper {
    static toDomain(message: MongoMessage): Message{
        return new Message({
            content: message.content,
            senderId: message.senderId,
            status: message.status,
            timestamp: message.timestamp,
            translatedContent: message.translatedContent,
            id: message.id
        })
    }
}