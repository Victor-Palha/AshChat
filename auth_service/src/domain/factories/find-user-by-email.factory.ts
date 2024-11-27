import { MongoUserRepository } from "../../persistence/repositories/mongo-user-repository";
import { FindUserByEmailUseCase } from "../use-cases/find-user-by-email-use-case";

export function findUserByEmailFactory() {
    const userRepository = new MongoUserRepository();
    const service = new FindUserByEmailUseCase(userRepository);
    return service;
}