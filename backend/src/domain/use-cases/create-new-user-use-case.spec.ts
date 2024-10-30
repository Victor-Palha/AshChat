import {beforeEach, describe, expect, it} from "vitest"
import { CreateNewUserUseCase } from "./create-new-user-use-case"
import { UserRepository } from "../repositories/user-repository"
import { InMemoryUserRepository } from "../repositories/in-memory/in-memory-user-repository"
import { faker } from '@faker-js/faker';

describe("CreateNewUserUseCase", () => {
    let sut: CreateNewUserUseCase
    let userRepository: UserRepository

    beforeEach(()=>{
        userRepository = new InMemoryUserRepository()
        sut = new CreateNewUserUseCase(userRepository)
    })

    it("should be able create a new user", async () => {
        const mockedUser = {
            nickname: faker.person.firstName(),
            email: faker.internet.email(),
            password: faker.internet.password(),
            preferredLanguage: 'en'
        }

        const user = await sut.execute(mockedUser)

        expect(user).toEqual({
            id: expect.any(String),
            nickname: mockedUser.nickname,
            email: mockedUser.email,
            preferredLanguage: 'EN',
        })
    })
})