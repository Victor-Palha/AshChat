import { describe, it, expect, beforeEach } from 'vitest';
import { AuthenticateUserUseCase } from './authenticate-user-use-case';
import { UserRepository } from '../repositories/user-repository';
import { UserCredentialsError } from './errors/user-credentials-error';
import { InMemoryUserRepository } from '../repositories/in-memory/in-memory-user-repository';
import { faker } from '@faker-js/faker';
import { createTestUserHelper } from './helpers/create-test-user-helper';
import { NewDeviceTryingToLogError } from './errors/new-device-trying-to-log-error';

describe('AuthenticateUserUseCase', () => {
    let userRepository: UserRepository;
    let sut: AuthenticateUserUseCase;

    beforeEach(() => {
        userRepository = new InMemoryUserRepository();
        sut = new AuthenticateUserUseCase(userRepository);
    });

    it('should throw UserCredentialsError if user does not exist', async () => {
        await expect(
            sut.execute({ email: 'test@example.com', password: 'password', deviceUniqueToken: 'token' })
        ).rejects.toThrow(UserCredentialsError);
    });

    it('should throw UserCredentialsError if password does not match', async () => {
        const passwordMocked = faker.internet.password();
        const emailMocked = faker.internet.email();

        const {uniqueTokenDevice} = await createTestUserHelper({
            userRepository,
            mockedEmail: emailMocked,
            mockedPassword: passwordMocked
        })

        await expect(
            sut.execute({ email: emailMocked, password: 'password', deviceUniqueToken: uniqueTokenDevice })
        ).rejects.toThrow(UserCredentialsError);
    });

    it('should throw NewDeviceTryingToLog if device tokens does not match', async () => {
        const passwordMocked = faker.internet.password();
        const emailMocked = faker.internet.email();

        await createTestUserHelper({
            userRepository,
            mockedEmail: emailMocked,
            mockedPassword: passwordMocked
        })

        await expect(
            sut.execute({ email: emailMocked, password: passwordMocked, deviceUniqueToken: 'token' })
        ).rejects.toThrow(NewDeviceTryingToLogError);
    });

    it('should return authorized true if credentials are correct', async () => {
        const passwordMocked = faker.internet.password();
        const emailMocked = faker.internet.email();
        
        const {uniqueTokenDevice} = await createTestUserHelper({
            userRepository,
            mockedEmail: emailMocked,
            mockedPassword: passwordMocked
        })

        const result = await sut.execute({ email: emailMocked, password: passwordMocked, deviceUniqueToken: uniqueTokenDevice });

        expect(result).toEqual({ user_id: expect.any(String) });
    });
});