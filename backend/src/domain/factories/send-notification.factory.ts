import { InMemoryChatRepository } from "../domain/repositories/in-memory/in-memory-chat-repository";
import { InMemoryNotificationRepository } from "../domain/repositories/in-memory/in-memory-notification-repository";
import { InMemoryUserRepository } from "../domain/repositories/in-memory/in-memory-user-repository";
import { SendNotificationUseCase } from "../domain/use-cases/send-notification-use-case";

export function sendNotificationFactory() {
    const notificationRepository = new InMemoryNotificationRepository();
    const userNotificationRepository = new InMemoryUserRepository();
    const chatRepository = new InMemoryChatRepository();
    const service = new SendNotificationUseCase(notificationRepository, userNotificationRepository, chatRepository);
    return service;
}