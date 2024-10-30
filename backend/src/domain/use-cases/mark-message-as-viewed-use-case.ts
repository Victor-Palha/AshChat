import { MessageStatus } from '../entities/message';
import { ChatRepository } from '../repositories/chat-repository';
import { NotificationRepository } from '../repositories/notification-repository';
import { NotificationNotFoundError } from './errors/notification-not-found-error';

type MarkNotificationAsViewedDTO = {
    notificationId: string;
}

export class MarkNotificationAsViewedUseCase {
    constructor(
        private notificationRepository: NotificationRepository,
        private chatRepository: ChatRepository,
    ) {}

    async execute({ notificationId }: MarkNotificationAsViewedDTO) {
        const notification = await this.notificationRepository.findById(notificationId);

        if (!notification) {
            throw new NotificationNotFoundError();
        }

        await this.notificationRepository.deleteNotification(notificationId);

        await this.chatRepository.changeMessageStatus(notification.chatId, notification.messageId, MessageStatus.READ);
    }
}
