import { Message } from "./message";
import { ID } from "./OV/id";

export interface ChatDTO {
    id?: string;
    usersID: string[];
    messages: Message[];
}

export class Chat {
    public id: ID;
    public usersID: string[];
    public messages: Message[];

    constructor(dataChat: ChatDTO){
        this.id = new ID(dataChat.id);
        this.usersID = dataChat.usersID || [];
        this.messages = dataChat.messages || [];
    }

    public addMessage(message: Message) {
        this.messages.push(message);
    }
}