import { describe, it, expect, beforeEach, vi } from 'vitest'
import { UserRepository } from '../repositories/user-repository'
import { UserNotFoundError } from './errors/user-not-found-error'
import { InMemoryUserRepository } from '../repositories/in-memory/in-memory-user-repository'
import { faker } from '@faker-js/faker'
import { ChangeUserPasswordUseCase } from './change-user-password-use-case'
import { randomUUID } from 'crypto'
import { createTestUserHelper } from './helpers/create-test-user-helper'

describe('change user password use case', () => {
    let sut: ChangeUserPasswordUseCase
    let userRepository: UserRepository

    beforeEach(() => {
        userRepository = new InMemoryUserRepository()

        sut = new ChangeUserPasswordUseCase(userRepository)
    })

    it('should be able to change a user password', async () => {
        const passwordMocked = faker.internet.password();
        const emailMocked = faker.internet.email();
        
        const {userMocked} = await createTestUserHelper({
            userRepository,
            mockedEmail: emailMocked,
            mockedPassword: passwordMocked
        })

        const {user} = await sut.execute({
            user_id: userMocked.id.getValue,
            new_password: faker.internet.password()
        })

        expect(user.id.getValue).toEqual(expect.any(String))
        expect(user.email).toEqual(emailMocked)
    })

    it('should not be able to change a user password if doen´t exists', async () => {
        await expect(sut.execute({
            user_id: randomUUID(),
            new_password: faker.internet.password()
        })).rejects.toThrow(UserNotFoundError)
    })
})