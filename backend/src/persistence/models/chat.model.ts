// src/models/chat.model.ts
import mongoose, { Document, Schema } from "mongoose";
import { MessageStatus } from "../../domain/entities/message";

export interface Message {
    id: string;
    senderId: string;
    content: string;
    translatedContent: string;
    timestamp: string;
    status: MessageStatus;
}

export interface ChatDocument extends Document {
    usersID: string[];
    messages: Message[];
    sameLanguage: boolean
}

const messageSchema = new Schema<Message>({
    id: { type: String, required: true },
    senderId: { type: String, required: true },
    content: { type: String, required: true },
    translatedContent: { type: String, required: true },
    timestamp: { type: String, required: true },
    status: { type: String, enum: Object.values(MessageStatus), required: true },
});


const chatSchema = new Schema<ChatDocument>({
    usersID: { type: [String], required: true },
    messages: [messageSchema],
    sameLanguage: {type: Boolean, default: false}
}, { timestamps: true });

export const ChatModel = mongoose.model<ChatDocument>("Chat", chatSchema);

