import { describe, it, expect, beforeEach } from 'vitest'
import { UserRepository } from '../repositories/user-repository'
import { UserNotFoundError } from './errors/user-not-found-error'
import { InMemoryUserRepository } from '../repositories/in-memory/in-memory-user-repository'
import { faker } from '@faker-js/faker'
import { FindUserByEmailUseCase } from './find-user-by-email-use-case'
import { createTestUserHelper } from './helpers/create-test-user-helper'

describe('Find user by email use case', () => {
    let sut: FindUserByEmailUseCase
    let userRepository: UserRepository

    beforeEach(() => {
        userRepository = new InMemoryUserRepository()

        sut = new FindUserByEmailUseCase(userRepository)
    })

    it('should be able to find a user by his email', async () => {
        const emailMock = faker.internet.email()

        await createTestUserHelper({
            userRepository,
            mockedEmail: emailMock
        })

        const {user} = await sut.execute(emailMock)

        expect(user.id.getValue).toEqual(expect.any(String))
        expect(user.email).toEqual(emailMock)
    })

    it('should not be able to find a user by his id if doen´t exists', async () => {
        const emailMock = faker.internet.email()

        await expect(sut.execute(emailMock)).rejects.toThrow(UserNotFoundError)
    })
})