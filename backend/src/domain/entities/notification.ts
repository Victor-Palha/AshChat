import { Message, MessageDTO } from "./message";
import { ID } from "./OV/id";

type NotificationDTO = {
    notification_id: string | null,
    chat_id: string,
    message: MessageDTO
}
export class Notification {
    public notification_id: ID
    public chat_id: string
    public message: MessageDTO

    constructor({notification_id, chat_id, message}: NotificationDTO){
        this.notification_id = new ID(notification_id)
        this.chat_id = chat_id
        this.message = message
    }

}