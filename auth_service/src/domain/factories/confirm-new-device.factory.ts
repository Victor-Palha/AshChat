import { MongoUserRepository } from "../../persistence/repositories/mongo-user-repository"
import { ChangeUserDeviceIdUseCase } from "../use-cases/change-user-device-id-use-case";

export function confirmNewDeviceFactory() {
    const UserRepository = new MongoUserRepository();
    const service = new ChangeUserDeviceIdUseCase(UserRepository);
    return service
}