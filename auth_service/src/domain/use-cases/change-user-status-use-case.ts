import { UserRepository } from "../repositories/user-repository";
import { UserNotFoundError } from "./errors/user-not-found-error";

type ChangeUserStatusDTO = {
    userId: string,
    online: boolean
}

export class ChangeUserStatusUseCase {
    constructor(
        private userRepository: UserRepository
    ){}

    async execute({userId, online}: ChangeUserStatusDTO){
        const userExists = await this.userRepository.findUserById(userId)
        if(!userExists){
            throw new UserNotFoundError();
        }

        await this.userRepository.changeStatus(userId, online)
    }
}