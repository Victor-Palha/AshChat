import { Notification } from "../../entities/notification";
import { NotificationRepository } from "../notification-repository";

export class InMemoryNotificationRepository implements NotificationRepository {
    private notifications: Notification[] = [];

    async create(notification: Notification): Promise<Notification> {
        this.notifications.push(notification);
        return notification;
    }

    async findById(id: string): Promise<Notification | null> {
        return this.notifications.find(notification => notification.id.getValue === id) || null;
    }

    async findByUserId(userId: string): Promise<Notification[]> {
        return this.notifications.filter(notification => notification.receiverId === userId);
    }

    async deleteNotification(id: string): Promise<void> {
        this.notifications = this.notifications.filter(notification => notification.id.getValue !== id);
    }
}
