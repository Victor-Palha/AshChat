import { MongoUserRepository } from "../../persistence/repositories/mongo-user-repository";
import { ChangeUserStatusUseCase } from "../use-cases/change-user-status-use-case";

export function changeUserStatusFactory() {
    const userRepository = new MongoUserRepository();
    const service = new ChangeUserStatusUseCase(userRepository);
    return service;
}