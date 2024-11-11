import { createHash } from "crypto";
import { UserRepository } from "../repositories/user-repository";
import { UserNotFoundError } from "./errors/user-not-found-error";

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
        const tokenHashed = createHash('sha256').update(newDeviceId).digest('hex')
        
        await this.userRepository.changeUserDeviceId(userId, tokenHashed, deviceOS, deviceNotificationToken);
    }
}