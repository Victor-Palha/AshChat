import { Message } from "./message";
import { ID } from "./OV/id";

export class Notification {
    constructor(
        public notification_id: ID,
        public chat_id: string,
        public message: Message
    ){}

}