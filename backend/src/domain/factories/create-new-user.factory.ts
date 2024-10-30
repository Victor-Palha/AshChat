import { InMemoryUserRepository } from "../domain/repositories/in-memory/in-memory-user-repository";
import { CreateNewUserUseCase } from "../domain/use-cases/create-new-user-use-case";

export function createNewUserFactory(){
    const userRepository = new InMemoryUserRepository()
    const service = new CreateNewUserUseCase(userRepository)
    return service
}