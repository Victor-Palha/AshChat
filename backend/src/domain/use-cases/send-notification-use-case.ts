import { MessageStatus } from "../entities/message";
import { Notification } from "../entities/notification";
import { ChatRepository } from "../repositories/chat-repository";
import { NotificationRepository } from "../repositories/notification-repository";
import { UserRepository } from "../repositories/user-repository";
import { UserNotFoundError } from "./errors/user-not-found-error";

export type SendNotificationDTO = {
    receiverId: string;
    messageId: string;
    chatId: string;
}

export class SendNotificationUseCase {
    constructor(
        private notificationRepository: NotificationRepository,
        private userRepository: UserRepository,
        private chatRepository: ChatRepository
    ) {}

    async execute({ receiverId, chatId, messageId }: SendNotificationDTO): Promise<Notification> {
        const userExists = await this.userRepository.findUserById(receiverId);
        if (!userExists) {
            throw new UserNotFoundError();
        }

        const notification = new Notification({
            receiverId,
            messageId,
            timestamp: new Date().toISOString(),
            read: false,
            chatId: chatId  
        });

        await this.chatRepository.changeMessageStatus(chatId, messageId, MessageStatus.SENT);

        return this.notificationRepository.create(notification);
    }
}