import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CreateNewChatUseCase } from './create-new-chat-use-case'
import { ChatRepository } from '../repositories/chat-repository'
import { UserRepository } from '../repositories/user-repository'
import { ChatAlreadyExistsError } from './errors/chat-already-exists-error'
import { UserNotFoundError } from './errors/user-not-found-error'
import { Chat } from '../entities/chat'
import { Message } from '../entities/message'
import { InMemoryChatRepository } from '../repositories/in-memory/in-memory-chat-repository'
import { InMemoryUserRepository } from '../repositories/in-memory/in-memory-user-repository'
import { faker } from '@faker-js/faker'

describe('CreateNewChatUseCase', () => {
    let sut: CreateNewChatUseCase
    let chatRepository: ChatRepository
    let userRepository: UserRepository

    beforeEach(() => {
        chatRepository = new InMemoryChatRepository()

        userRepository = new InMemoryUserRepository()

        sut = new CreateNewChatUseCase(chatRepository, userRepository)
    })

    it('should create a new chat successfully', async () => {
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

        const response = await sut.execute({ 
            senderId: sender.id.getValue, 
            receiverId: receiver.id.getValue, 
            content 
        })

        expect(response.chat.id.getValue).toEqual(expect.any(String))
    })

    it('should throw UserNotFoundError if sender does not exist', async () => {
        const content = 'Hello!'
        const nonExistentUserId = faker.string.uuid()

        const receiver = await userRepository.createUser({
            email: faker.internet.email(),
            nickname: faker.person.firstName(),
            password: faker.internet.password(),
            preferredLanguage: 'en'
        })

        await expect(sut.execute({ 
            senderId: nonExistentUserId, 
            receiverId: receiver.id.getValue, 
            content 
        })).rejects.toThrow(UserNotFoundError)
    })

    it('should throw UserNotFoundError if receiver does not exist', async () => {
        const content = 'Hello!'
        const nonExistentUserId = faker.string.uuid()

        const sender = await userRepository.createUser({
            email: faker.internet.email(),
            nickname: faker.person.firstName(),
            password: faker.internet.password(),
            preferredLanguage: 'en'
        })

        await expect(sut.execute({ 
            senderId: sender.id.getValue, 
            receiverId: nonExistentUserId, 
            content 
        })).rejects.toThrow(UserNotFoundError)
    })

    it.only('should throw ChatAlreadyExistsError if chat already exists', async () => {
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

        await sut.execute({ 
            senderId: sender.id.getValue, 
            receiverId: receiver.id.getValue, 
            content 
        })

        await expect(sut.execute({ 
            senderId: sender.id.getValue, 
            receiverId: receiver.id.getValue, 
            content 
        })).rejects.toThrow(ChatAlreadyExistsError)
    })
})