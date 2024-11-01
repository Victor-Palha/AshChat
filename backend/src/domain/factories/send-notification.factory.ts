import { MongoChatRepository } from "../../persistence/repositories/mongo-chat-repository";
import { MongoUserRepository } from "../../persistence/repositories/mongo-user-repository";
import { InMemoryNotificationRepository } from "../repositories/in-memory/in-memory-notification-repository";
import { SendNotificationUseCase } from "../use-cases/send-notification-use-case";

export function sendNotificationFactory() {
    const notificationRepository = new InMemoryNotificationRepository();
    const userRepository = new MongoUserRepository();
    const chatRepository = new MongoChatRepository();
    const service = new SendNotificationUseCase(notificationRepository, userRepository, chatRepository);
    return service;
}