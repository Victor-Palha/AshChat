import { MongoUserRepository } from "../../persistence/repositories/mongo-user-repository";
import { VerifyUserDeviceUniqueTokenUseCase } from "../use-cases/verify-user-unique-token-device-use-case";

export function verifyUniqueTokenDeviceFactory() {
    const userRepository = new MongoUserRepository()
    const service = new VerifyUserDeviceUniqueTokenUseCase(userRepository)
    return service
}