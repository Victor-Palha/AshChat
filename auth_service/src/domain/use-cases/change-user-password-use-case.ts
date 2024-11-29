import { hash } from "bcryptjs";
import { UserRepository } from "../repositories/user-repository";
import { UserNotFoundError } from "./errors/user-not-found-error";
import { User } from "../entities/user";

type ChangeUserPasswordDTO = {
    user_id: string;
    new_password: string;
}

type ChangeUserPasswordResponse = {
    user: User
}

export class ChangeUserPasswordUseCase {
    constructor(
        private userRepository: UserRepository,
    ){}

    async execute({ user_id, new_password }: ChangeUserPasswordDTO): Promise<ChangeUserPasswordResponse> {
        const user = await this.userRepository.findUserById(user_id);

        if(!user){
            throw new UserNotFoundError();
        }

        const newPasswordHash = await hash(new_password, 8);
        const userUpdated = await this.userRepository.changePassword(user_id, newPasswordHash);

        return {
            user: userUpdated
        };
    }
}