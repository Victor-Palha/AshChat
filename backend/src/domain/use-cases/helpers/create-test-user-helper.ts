import { randomUUID } from "crypto";
import { UserRepository } from "../../repositories/user-repository";
import { faker } from "@faker-js/faker";
import { hash } from "bcryptjs";

type CreateTestUserHelperDTO = {
    userRepository: UserRepository,
    mockedEmail?: string,
    mockedPassword?: string
}
export async function createTestUserHelper({userRepository, mockedEmail, mockedPassword}: CreateTestUserHelperDTO){
    let passMocked: string = await hash(faker.internet.password(), 8)
    if(mockedPassword){
        passMocked = await hash(mockedPassword, 8)
    }
    const user = await userRepository.createUser({
        email: mockedEmail ?? faker.internet.email(),
        nickname: faker.person.firstName(),
        password: passMocked,
        preferredLanguage: 'en',
        devices: {
            deviceOS: "IOS",
            deviceNotificationToken: randomUUID(),
            deviceUniqueToken: randomUUID()
        }
    })

    return {userMocked: user}
}