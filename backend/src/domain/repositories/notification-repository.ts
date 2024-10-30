import { Notification } from "../entities/notification";

export abstract class NotificationRepository {
    abstract create(notification: Notification): Promise<Notification>;
    abstract findById(id: string): Promise<Notification | null>;
    abstract findByUserId(userId: string): Promise<Notification[]>;
    abstract deleteNotification(id: string): Promise<void>;
}
