import { ID } from "./OV/id";

export interface MessageDTO {
    id?: string;
    senderId: string;
    content: string;
    translatedContent: string;
    timestamp: string;
    status: MessageStatus;
}

export enum MessageStatus {
    SENT = "SENT",
    RECEIVED = "RECEIVED",
    READ = "READ"
}

export class Message {
    public id: ID;
    public senderId: ID;
    public content: string;
    public translatedContent: string;
    public timestamp: string;
    public status: MessageStatus;

    constructor(dataMessage: MessageDTO){
        this.id = new ID(dataMessage.id);
        this.senderId = new ID(dataMessage.senderId);
        this.content = dataMessage.content;
        this.timestamp = dataMessage.timestamp;
        this.status = dataMessage.status;
        this.translatedContent = dataMessage.translatedContent;
    }

    public toMongo(): MessageDTO {
        return {
            senderId: this.senderId.getValue,
            content: this.content,
            timestamp: this.timestamp,
            status: this.status,
            translatedContent: this.translatedContent
        };
    }

    public toNotification(): MessageDTO{
        return {
            id: this.id.getValue,
            content: this.content,
            translatedContent: this.translatedContent,
            senderId: this.senderId.getValue,
            status: this.status,
            timestamp: this.timestamp
        }
    }
}