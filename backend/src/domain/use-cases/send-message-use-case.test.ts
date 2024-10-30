import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SendMessageUseCase } from './send-message-use-case';
import { ChatRepository } from '../repositories/chat-repository';
import { ChatNotFoundError } from './errors/chat-not-found-error';
import { Message, MessageStatus } from '../entities/message';
import { InMemoryChatRepository } from '../repositories/in-memory/in-memory-chat-repository';
import { faker } from '@faker-js/faker';
import { UserRepository } from '../repositories/user-repository';
import { InMemoryUserRepository } from '../repositories/in-memory/in-memory-user-repository';
import { CreateNewChatUseCase } from './create-new-chat-use-case';

describe('SendMessageUseCase', () => {
    let sut: SendMessageUseCase;
    let helper: CreateNewChatUseCase;
    let userRepository: UserRepository;
    let chatRepository: ChatRepository;

    beforeEach(() => {
        chatRepository = new InMemoryChatRepository();
        userRepository = new InMemoryUserRepository();
        sut = new SendMessageUseCase(chatRepository);
        helper = new CreateNewChatUseCase(chatRepository, userRepository);
    })

    it('should send a message successfully', async () => {

        const content = 'Hello!'

        const sender = await userRepository.createUser({
            email: faker.internet.email(),
            nickname: faker.person.firstName(),
            password: faker.internet.password(),
            preferredLanguage: 'en'
        })

        const receiver = await userRepository.createUser({
            email: faker.internet.email(),
            nickname: faker.person.firstName(),
            password: faker.internet.password(),
            preferredLanguage: 'en'
        })

        const {chat} = await helper.execute({ 
            senderId: sender.id.getValue, 
            receiverId: receiver.id.getValue, 
            content 
        })

        expect(sut.execute({
            chatID: chat.id.getValue,
            content: 'hi!',
            senderId: receiver.id.getValue
        })).resolves.ok
        
        const chatUpdated = await chatRepository.findById(chat.id.getValue)
        expect(chatUpdated?.messages.length).toEqual(2)
    });

    it('should throw ChatNotFoundError if chat does not exist', async () => {
        await expect(sut.execute({
            chatID: 'non-existent-chat-id',
            content: 'hi!',
            senderId: 'some-sender-id'
        })).rejects.toThrow(ChatNotFoundError);
    });

    it('should add the message to the chat', async () => {
        const content = 'Hello!'

        const sender = await userRepository.createUser({
            email: faker.internet.email(),
            nickname: faker.person.firstName(),
            password: faker.internet.password(),
            preferredLanguage: 'en'
        })

        const receiver = await userRepository.createUser({
            email: faker.internet.email(),
            nickname: faker.person.firstName(),
            password: faker.internet.password(),
            preferredLanguage: 'en'
        })

        const {chat} = await helper.execute({ 
            senderId: sender.id.getValue, 
            receiverId: receiver.id.getValue, 
            content 
        })

        await sut.execute({
            chatID: chat.id.getValue,
            content: 'hi!',
            senderId: receiver.id.getValue
        });

        const chatUpdated = await chatRepository.findById(chat.id.getValue)
        expect(chatUpdated?.messages[1].content).toEqual('hi!')
    });

    it('should set the message status to sent', async () => {
        const content = 'Hello!'

        const sender = await userRepository.createUser({
            email: faker.internet.email(),
            nickname: faker.person.firstName(),
            password: faker.internet.password(),
            preferredLanguage: 'en'
        })

        const receiver = await userRepository.createUser({
            email: faker.internet.email(),
            nickname: faker.person.firstName(),
            password: faker.internet.password(),
            preferredLanguage: 'en'
        })

        const {chat} = await helper.execute({ 
            senderId: sender.id.getValue, 
            receiverId: receiver.id.getValue, 
            content 
        })

        await sut.execute({
            chatID: chat.id.getValue,
            content: 'hi!',
            senderId: receiver.id.getValue
        });

        const chatUpdated = await chatRepository.findById(chat.id.getValue)
        expect(chatUpdated?.messages[1].status).toEqual(MessageStatus.SENT)
    });
});