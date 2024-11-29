import { MongoUserRepository } from "../../persistence/repositories/mongo-user-repository";
import { FindUserIdUseCase } from "../use-cases/find-user-by-id-use-case";

export function findUserByIdFactory(){
    const userRepository = new MongoUserRepository();
    const service = new FindUserIdUseCase(userRepository)
    return service
}