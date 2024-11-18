import { Chat } from "../../domain/entities/chat";
import { Message } from "../../domain/entities/message";
import { ChatDocument } from "../models/chat.model";

export class ChatMapper {

    static toDomain(chatDocument: ChatDocument): Chat {

        const messages = chatDocument.messages ? chatDocument.messages.map((message)=>{
            return new Message({
                content: message.content,
                senderId: message.senderId,
                status: message.status,
                timestamp: message.timestamp,
                translatedContent: message.translatedContent,
                id: message.id
            })
        }) : []

        return new Chat({
            id: chatDocument.id,
            usersID: chatDocument.usersID,
            sameLanguage: chatDocument.sameLanguage,
            messages: messages
        });
    }
}
