import { ID } from "./OV/id";

export interface NotificationDTO {
    id?: string; 
    receiverId: string; 
    chatId: string;
    messageId: string;
    timestamp: string;
    read: boolean;
}

export class Notification {
    public id: ID;
    public receiverId: string;
    public chatId: string;
    public messageId: string;
    public timestamp: string;
    public read: boolean;

    constructor(data: NotificationDTO) {
        this.id = new ID(data.id);
        this.receiverId = data.receiverId;
        this.chatId = data.chatId;
        this.messageId = data.messageId;
        this.timestamp = data.timestamp || new Date().toISOString();
        this.read = data.read || false;
    }

    public toDTO(): NotificationDTO {
        return {
            id: this.id.getValue,
            receiverId: this.receiverId,
            chatId: this.chatId,
            messageId: this.messageId,
            timestamp: this.timestamp,
            read: this.read
        };
    }
}
