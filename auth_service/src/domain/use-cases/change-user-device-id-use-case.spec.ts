import { describe, it, expect, beforeEach } from 'vitest';
import { UserRepository } from '../repositories/user-repository';
import { InMemoryUserRepository } from '../repositories/in-memory/in-memory-user-repository';
import { faker } from '@faker-js/faker';
import { createTestUserHelper } from './helpers/create-test-user-helper';
import { ChangeUserDeviceIdUseCase } from './change-user-device-id-use-case';
import { createHash, randomUUID } from 'crypto';
import { UserNotFoundError } from './errors/user-not-found-error';

describe('Change user device id', () => {
    let userRepository: UserRepository;
    let sut: ChangeUserDeviceIdUseCase;

    beforeEach(() => {
        userRepository = new InMemoryUserRepository();
        sut = new ChangeUserDeviceIdUseCase(userRepository);
    });

    it('should throw UserNotFound if user does not exist', async () => {
        await expect(
            sut.execute({ userId: randomUUID(), newDeviceId: 'token', deviceOS: 'os', deviceNotificationToken: 'token' })
        ).rejects.toThrow(UserNotFoundError);
    });

    it('should return change user device allowed if user exists and are with correct credentials', async () => {
        const passwordMocked = faker.internet.password();
        const emailMocked = faker.internet.email();
        
        const {uniqueTokenDevice, userMocked} = await createTestUserHelper({
            userRepository,
            mockedEmail: emailMocked,
            mockedPassword: passwordMocked
        })
        const newDeviceId = randomUUID()
        const newOS = "Android"
        const newNotificationToken = randomUUID()

        await sut.execute({
            userId: userMocked.id.getValue,
            newDeviceId: newDeviceId,
            deviceOS: newOS,
            deviceNotificationToken: newNotificationToken
        });
        

        const searchedUser = await userRepository.findUserById(userMocked.id.getValue);
        const resultExpected = createHash('sha256').update(newDeviceId).digest('hex');
        expect(searchedUser?.devices.deviceUniqueToken).toEqual(resultExpected);
        expect(searchedUser?.devices.deviceOS).toEqual(newOS);
        expect(searchedUser?.devices.deviceNotificationToken).toEqual(newNotificationToken);
    });
});