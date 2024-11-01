import { MongoUserRepository } from "../../persistence/repositories/mongo-user-repository";
import { CreateNewUserUseCase } from "../use-cases/create-new-user-use-case";

export function createNewUserFactory(){
    const userRepository = new MongoUserRepository()
    const service = new CreateNewUserUseCase(userRepository)
    return service
}