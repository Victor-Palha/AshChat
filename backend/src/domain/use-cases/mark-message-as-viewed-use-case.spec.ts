import { describe, it, expect, beforeEach } from 'vitest';
import { NotificationRepository } from '../repositories/notification-repository';
import { InMemoryNotificationRepository } from '../repositories/in-memory/in-memory-notification-repository';
import { ChatRepository } from '../repositories/chat-repository';
import { InMemoryChatRepository } from '../repositories/in-memory/in-memory-chat-repository';
import { UserRepository } from '../repositories/user-repository';
import { SendNotificationUseCase } from './send-notification-use-case';
import { faker } from '@faker-js/faker';
import { MessageStatus } from '../entities/message';
import { MarkNotificationAsViewedUseCase } from './mark-message-as-viewed-use-case';
import { InMemoryUserRepository } from '../repositories/in-memory/in-memory-user-repository';
import { CreateNewChatUseCase } from './create-new-chat-use-case';

describe('MarkNotificationAsViewedUseCase', () => {
    let sut: MarkNotificationAsViewedUseCase;
    let notificationRepository: NotificationRepository;
    let chatRepository: ChatRepository;
    let userRepository: UserRepository;
    let senderId: string;
    let receiverId: string;
    let notificationId: string;
    let chatId: string;
    let messageId: string;

    beforeEach(async () => {
        notificationRepository = new InMemoryNotificationRepository();
        chatRepository = new InMemoryChatRepository();
        userRepository = new InMemoryUserRepository();
        sut = new MarkNotificationAsViewedUseCase(notificationRepository, chatRepository);

        // Criação dos usuários
        const sender = await userRepository.createUser({
            email: faker.internet.email(),
            nickname: faker.person.firstName(),
            password: faker.internet.password(),
            preferredLanguage: 'en',
        });

        const receiver = await userRepository.createUser({
            email: faker.internet.email(),
            nickname: faker.person.firstName(),
            password: faker.internet.password(),
            preferredLanguage: 'en',
        });

        senderId = sender.id.getValue;
        receiverId = receiver.id.getValue;

        // Criação de um novo chat
        const { chat } = await new CreateNewChatUseCase(chatRepository, userRepository).execute({
            senderId: sender.id.getValue,
            receiverId: receiver.id.getValue,
            content: 'Hello there!'
        });

        chatId = chat.id.getValue;
        messageId = chat.messages[0].id.getValue;

        // Envio de notificação
        const sendNotificationUseCase = new SendNotificationUseCase(notificationRepository, userRepository, chatRepository);
        const notification = await sendNotificationUseCase.execute({
            receiverId: receiverId,
            chatId: chat.id.getValue,
            messageId: chat.messages[0].id.getValue
        });

        notificationId = notification.id.getValue; // Obtendo o ID da notificação
    });

    it('should delete the notification and mark the message as read', async () => {
        await sut.execute({ notificationId });

        const notification = await notificationRepository.findById(notificationId);
        expect(notification).toBe(null); // A notificação deve ser excluída

        const messageStatus = await chatRepository.findMessageById(chatId, messageId);
        expect(messageStatus?.status).toBe(MessageStatus.READ); // O status da mensagem deve ser READ
    });

    it('should throw an error if the notification does not exist', async () => {
        const nonExistentNotificationId = 'non-existent-notification-id';

        await expect(sut.execute({ notificationId: nonExistentNotificationId }))
            .rejects.toThrow('Notification not found'); // Deve lançar erro ao tentar acessar uma notificação inexistente
    });
});
