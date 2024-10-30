import { describe, it, expect, beforeEach } from 'vitest';
import { SendNotificationUseCase } from './send-notification-use-case';
import { NotificationRepository } from '../repositories/notification-repository';
import { InMemoryNotificationRepository } from '../repositories/in-memory/in-memory-notification-repository';
import { faker } from '@faker-js/faker';
import { UserRepository } from '../repositories/user-repository';
import { InMemoryUserRepository } from '../repositories/in-memory/in-memory-user-repository';
import { ChatRepository } from '../repositories/chat-repository';
import { InMemoryChatRepository } from '../repositories/in-memory/in-memory-chat-repository';
import { randomUUID } from 'node:crypto';
import { User } from '../entities/user';
import { CreateNewChatUseCase } from './create-new-chat-use-case';
import { UserNotFoundError } from './errors/user-not-found-error';

describe('SendNotificationUseCase', () => {
    let sut: SendNotificationUseCase;
    let userRepository: UserRepository;
    let notificationRepository: NotificationRepository;
    let chatRepository: ChatRepository;
    let sender: User;
    let receiver: User;
    let chatId: string;
    let messageId: string;

    beforeEach(async () => {
        notificationRepository = new InMemoryNotificationRepository();
        chatRepository = new InMemoryChatRepository();
        userRepository = new InMemoryUserRepository();
        sut = new SendNotificationUseCase(notificationRepository, userRepository, chatRepository);
        
        sender = await userRepository.createUser({
            email: faker.internet.email(),
            nickname: faker.person.firstName(),
            password: faker.internet.password(),
            preferredLanguage: 'en',
        });

        receiver = await userRepository.createUser({
            email: faker.internet.email(),
            nickname: faker.person.firstName(),
            password: faker.internet.password(),
            preferredLanguage: 'en',
        });

        const { chat } = await new CreateNewChatUseCase(chatRepository, userRepository).execute({
            senderId: sender.id.getValue,
            receiverId: receiver.id.getValue,
            content: 'Hello!'
        });

        chatId = chat.id.getValue;
        messageId = chat.messages[0].id.getValue;
    });

    it('should send a notification successfully', async () => {
        await sut.execute({
            receiverId: receiver.id.getValue,
            chatId,
            messageId
        });

        const notifications = await notificationRepository.findByUserId(receiver.id.getValue);

        expect(notifications.length).toBe(1);
        expect(notifications[0].chatId).toEqual(chatId);
        expect(notifications[0].messageId).toEqual(messageId); // Verifica se o ID da mensagem está correto
    });

    it('should throw an error if the user does not exist', async () => {
        const nonExistentReceiverId = 'non-existent-user-id';
        const randomChatId = randomUUID();
        const randomMessageId = randomUUID();

        await expect(sut.execute({
            receiverId: nonExistentReceiverId,
            chatId: randomChatId,
            messageId: randomMessageId
        })).rejects.toThrow(UserNotFoundError);
    });
});
