import { InMemoryUserRepository } from "../domain/repositories/in-memory/in-memory-user-repository";
import { AuthenticateUserUseCase } from "../domain/use-cases/authenticate-user-use-case";

export function authenticateUserFactory(){
    const userRepository = new InMemoryUserRepository()
    const service = new AuthenticateUserUseCase(userRepository)
    return service
}