import { MongoUserRepository } from "../../persistence/repositories/mongo-user-repository";
import { AuthenticateUserUseCase } from "../use-cases/authenticate-user-use-case";

export function authenticateUserFactory(){
    const userRepository = new MongoUserRepository()
    const service = new AuthenticateUserUseCase(userRepository)
    return service
}