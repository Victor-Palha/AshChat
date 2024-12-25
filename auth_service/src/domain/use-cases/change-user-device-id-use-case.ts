import { UserRepository } from "../repositories/user-repository";
import { UserNotFoundError } from "./errors/user-not-found-error";
import { hashDeviceToken } from "../../helper/hash-device-token-helper";

type ChangeUserDeviceIdDTO = {
    userId: string;
    newDeviceId: string;
    deviceOS: string;
    deviceNotificationToken: string;
}
export class ChangeUserDeviceIdUseCase {
    constructor(
        private userRepository: UserRepository,
    ){}

    async execute({userId, newDeviceId, deviceOS, deviceNotificationToken}: ChangeUserDeviceIdDTO): Promise<void> {
        const userExists = await this.userRepository.findUserById(userId);
        if(!userExists){
            throw new UserNotFoundError();
        }
        const tokenHashed = hashDeviceToken(newDeviceId);
        
        await this.userRepository.changeUserDeviceId(userId, tokenHashed, deviceOS, deviceNotificationToken);
    }
}