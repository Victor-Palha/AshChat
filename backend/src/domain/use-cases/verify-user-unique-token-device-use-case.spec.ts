import { describe, it, expect, beforeEach } from 'vitest';
import { UserRepository } from '../repositories/user-repository';
import { InMemoryUserRepository } from '../repositories/in-memory/in-memory-user-repository';
import { faker } from '@faker-js/faker';
import { createTestUserHelper } from './helpers/create-test-user-helper';
import { randomUUID } from 'crypto';
import { UserNotFoundError } from './errors/user-not-found-error';
import { VerifyUserDeviceUniqueTokenUseCase } from './verify-user-unique-token-device-use-case';

describe('Verify user device id', () => {
    let userRepository: UserRepository;
    let sut: VerifyUserDeviceUniqueTokenUseCase;

    beforeEach(() => {
        userRepository = new InMemoryUserRepository();
        sut = new VerifyUserDeviceUniqueTokenUseCase(userRepository);
    });

    it('should throw UserNotFound if user does not exist', async () => {
        await expect(
            sut.execute({ user_id: randomUUID(), deviceUniqueToken: 'token'})
        ).rejects.toThrow(UserNotFoundError);
    });

    it('should return valid if user device are correct', async () => {
        const passwordMocked = faker.internet.password();
        const emailMocked = faker.internet.email();
        
        const {uniqueTokenDevice, userMocked} = await createTestUserHelper({
            userRepository,
            mockedEmail: emailMocked,
            mockedPassword: passwordMocked
        })

        const response = await sut.execute({
            user_id: userMocked.id.getValue,
            deviceUniqueToken: uniqueTokenDevice
        });
        

        expect(response.isValid).toEqual(true);
    });
});