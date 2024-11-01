import {beforeEach, describe, expect, it} from "vitest"
import { CreateNewUserUseCase } from "./create-new-user-use-case"
import { UserRepository } from "../repositories/user-repository"
import { InMemoryUserRepository } from "../repositories/in-memory/in-memory-user-repository"
import { faker } from '@faker-js/faker';
import { CreateTemporaryUserUseCase } from "./create-temporary-user-use-case";
import { UserWithSameEmailError } from "./errors/user-with-same-email-error";

describe("Create temporaty User Use Case", () => {
    let sut: CreateTemporaryUserUseCase
    let userRepository: UserRepository

    beforeEach(()=>{
        userRepository = new InMemoryUserRepository()
        sut = new CreateTemporaryUserUseCase(userRepository)
    })

    it("should be able create a new temporaty user", async () => {
        const mockedUser = {
            nickname: faker.person.firstName(),
            email: faker.internet.email(),
            password: faker.internet.password(),
            preferredLanguage: 'en'
        }

        const {temporaryUser} = await sut.execute(mockedUser)

        expect(temporaryUser).toEqual({
            nickname: mockedUser.nickname,
            email: mockedUser.email,
            preferredLanguage: 'EN',
            password: expect.any(String),
            emailCode: expect.any(String)
        })
    })

    it("should not be able to create a new temporary user with same email than other one", async ()=>{
        const mockEmail = faker.internet.email()
        await userRepository.createUser({
            email: mockEmail,
            nickname: faker.person.firstName(),
            password: faker.internet.password(),
            preferredLanguage: "EN"
        })

        expect(sut.execute({
            email: mockEmail,
            nickname: faker.person.firstName(),
            password: faker.internet.password(),
            preferredLanguage: "EN"
        })).rejects.toBeInstanceOf(UserWithSameEmailError)
    })
})