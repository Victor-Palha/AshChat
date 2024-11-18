import { describe, it, expect, beforeEach } from 'vitest';
import { SendMessageUseCase } from './send-message-use-case';
import { ChatRepository } from '../repositories/chat-repository';
import { ChatNotFoundError } from './errors/chat-not-found-error';
import { MessageStatus } from '../entities/message';
import { InMemoryChatRepository } from '../repositories/in-memory/in-memory-chat-repository';
import { UserRepository } from '../repositories/user-repository';
import { InMemoryUserRepository } from '../repositories/in-memory/in-memory-user-repository';
import { CreateNewChatUseCase } from './create-new-chat-use-case';
import { createTestUserHelper } from './helpers/create-test-user-helper';

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

        const {userMocked: sender} = await createTestUserHelper({
            userRepository,
        })

        const {userMocked: receiver} = await createTestUserHelper({
            userRepository,
        })

        const {chat} = await helper.execute({ 
            senderId: sender.id.getValue, 
            receiverId: receiver.id.getValue, 
        })

        expect(sut.execute({
            chatID: chat.id.getValue,
            content: 'hi!',
            senderId: receiver.id.getValue
        })).resolves.ok
        
        const chatUpdated = await chatRepository.findById(chat.id.getValue)
        expect(chatUpdated?.messages.length).toEqual(1)
    });

    it('should throw ChatNotFoundError if chat does not exist', async () => {
        await expect(sut.execute({
            chatID: 'non-existent-chat-id',
            content: 'hi!',
            senderId: 'some-sender-id'
        })).rejects.toThrow(ChatNotFoundError);
    });

    it('should add the message to the chat', async () => {
        const {userMocked: sender} = await createTestUserHelper({
            userRepository,
        })

        const {userMocked: receiver} = await createTestUserHelper({
            userRepository,
        })

        const {chat} = await helper.execute({ 
            senderId: sender.id.getValue, 
            receiverId: receiver.id.getValue, 
        })

        await sut.execute({
            chatID: chat.id.getValue,
            content: 'hi!',
            senderId: receiver.id.getValue
        });

        const chatUpdated = await chatRepository.findById(chat.id.getValue)
        expect(chatUpdated?.messages[0].content).toEqual('hi!')
    });

    it('should set the message status to sent', async () => {
        const {userMocked: sender} = await createTestUserHelper({
            userRepository,
        })

        const {userMocked: receiver} = await createTestUserHelper({
            userRepository,
        })

        const {chat} = await helper.execute({ 
            senderId: sender.id.getValue, 
            receiverId: receiver.id.getValue, 
        })

        await sut.execute({
            chatID: chat.id.getValue,
            content: 'hi!',
            senderId: receiver.id.getValue
        });

        const chatUpdated = await chatRepository.findById(chat.id.getValue)
        expect(chatUpdated?.messages[0].status).toEqual(MessageStatus.SENT)
    });
});