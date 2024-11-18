import { User } from "../entities/user";
import { UserRepository } from "../repositories/user-repository";
import { UserNotFoundError } from "./errors/user-not-found-error";

export class FindUserIdUseCase {
    constructor(
        private userRepository: UserRepository
    ) {}
    async execute(userId: string): Promise<User> {
        const user = await this.userRepository.findUserById(userId);
        if (!user) {
            throw new UserNotFoundError();
        }
        return user;
    }
}