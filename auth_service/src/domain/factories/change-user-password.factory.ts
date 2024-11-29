import { MongoUserRepository } from "../../persistence/repositories/mongo-user-repository";
import { ChangeUserPasswordUseCase } from "../use-cases/change-user-password-use-case";

export function changeUserPasswordFactory() {
    const userRepository = new MongoUserRepository();
    const service = new ChangeUserPasswordUseCase(userRepository);
    return service;
}