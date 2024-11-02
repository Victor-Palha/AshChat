import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CreateNewChatUseCase } from './create-new-chat-use-case'
import { ChatRepository } from '../repositories/chat-repository'
import { UserRepository } from '../repositories/user-repository'
import { ChatAlreadyExistsError } from './errors/chat-already-exists-error'
import { UserNotFoundError } from './errors/user-not-found-error'
import { InMemoryChatRepository } from '../repositories/in-memory/in-memory-chat-repository'
import { InMemoryUserRepository } from '../repositories/in-memory/in-memory-user-repository'
import { faker } from '@faker-js/faker'
import { FindUserByEmailUseCase } from './find-user-by-email-use-case'
import { ChangeUserPasswordUseCase } from './change-user-password-use-case'
import { randomUUID } from 'crypto'

describe('change user password use case', () => {
    let sut: ChangeUserPasswordUseCase
    let userRepository: UserRepository

    beforeEach(() => {
        userRepository = new InMemoryUserRepository()

        sut = new ChangeUserPasswordUseCase(userRepository)
    })

    it('should be able to change a user password', async () => {
        const emailMock = faker.internet.email()

        const userMock = await userRepository.createUser({
            email: emailMock,
            nickname: faker.person.firstName(),
            password: faker.internet.password(),
            preferredLanguage: 'en'
        })

        const {user} = await sut.execute({
            user_id: userMock.id.getValue,
            new_password: faker.internet.password()
        })

        expect(user.id.getValue).toEqual(expect.any(String))
        expect(user.email).toEqual(emailMock)
    })

    it('should not be able to change a user password if doen´t exists', async () => {
        await expect(sut.execute({
            user_id: randomUUID(),
            new_password: faker.internet.password()
        })).rejects.toThrow(UserNotFoundError)
    })
})