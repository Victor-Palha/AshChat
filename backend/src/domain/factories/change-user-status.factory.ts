import { InMemoryUserRepository } from "../domain/repositories/in-memory/in-memory-user-repository";
import { ChangeUserStatusUseCase } from "../domain/use-cases/change-user-status-use-case";

export function changeUserStatusFactory() {
    const userRepository = new InMemoryUserRepository();
    const service = new ChangeUserStatusUseCase(userRepository);
    return service;
}