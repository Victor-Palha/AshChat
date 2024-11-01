import { MongoUserRepository } from "../../persistence/repositories/mongo-user-repository";
import { CreateTemporaryUserUseCase } from "../use-cases/create-temporary-user-use-case";

export function createTemporaryUserFactory(){
    const userRepository = new MongoUserRepository()
    const service = new CreateTemporaryUserUseCase(userRepository)
    return service
}