import { User } from "../entities/user";
import { UserRepository } from "../repositories/user-repository";
import { UserNotFoundError } from "./errors/user-not-found-error";

type FindUserByEmailUseCaseResponse = {
    user: User;
}
export class FindUserByEmailUseCase {
    constructor(
        private userRepository: UserRepository
    ) {}
    
    async execute(email: string): Promise<FindUserByEmailUseCaseResponse> {
        const userExists = await this.userRepository.findUserByEmail(email);
        if(!userExists) {
            throw new UserNotFoundError();
        }

        return {
            user: userExists
        };
    }
}