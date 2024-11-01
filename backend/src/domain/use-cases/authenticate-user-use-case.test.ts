import { describe, it, expect, beforeEach } from 'vitest';
import { AuthenticateUserUseCase } from './authenticate-user-use-case';
import { UserRepository } from '../repositories/user-repository';
import { UserCredentialsError } from './errors/user-credentials-error';
import { hash } from 'bcryptjs';
import { InMemoryUserRepository } from '../repositories/in-memory/in-memory-user-repository';
import { faker } from '@faker-js/faker';

describe('AuthenticateUserUseCase', () => {
    let userRepository: UserRepository;
    let sut: AuthenticateUserUseCase;

    beforeEach(() => {
        userRepository = new InMemoryUserRepository();
        sut = new AuthenticateUserUseCase(userRepository);
    });

    it('should throw UserCredentialsError if user does not exist', async () => {
        await expect(
            sut.execute({ email: 'test@example.com', password: 'password' })
        ).rejects.toThrow(UserCredentialsError);
    });

    it('should throw UserCredentialsError if password does not match', async () => {
        const passwordMocked = faker.internet.password();
        const emailMocked = faker.internet.email();
        await userRepository.createUser({
            email: emailMocked,
            nickname: faker.person.firstName(),
            password: await hash(passwordMocked, 8),
            preferredLanguage: 'en',
        })

        await expect(
            sut.execute({ email: emailMocked, password: 'password' })
        ).rejects.toThrow(UserCredentialsError);
    });

    it('should return authorized true if credentials are correct', async () => {
        const passwordMocked = faker.internet.password();

        const emailMocked = faker.internet.email();

        await userRepository.createUser({
            email: emailMocked,
            nickname: faker.person.firstName(),
            password: await hash(passwordMocked, 8),
            preferredLanguage: 'en',
        })

        const result = await sut.execute({ email: emailMocked, password: passwordMocked });

        expect(result).toEqual({ user_id: expect.any(String) });
    });
});