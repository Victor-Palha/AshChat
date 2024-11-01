import { hash } from "bcryptjs";
import { UserDTO } from "../entities/user";
import { UserRepository } from "../repositories/user-repository";
import { UserWithSameEmailError } from "./errors/user-with-same-email-error";

export type CreateTemporatyUserDTO = Omit<UserDTO, 'id' | 'online' | 'chatsID' | 'contactsID'>

export class CreateTemporaryUserUseCase {
    constructor(
        private userRepository: UserRepository
    ){}

    async execute({email, nickname, password, preferredLanguage}: CreateTemporatyUserDTO){
        const userWithSameEmailExists = await this.userRepository.findUserByEmail(email)
        if(userWithSameEmailExists){
            throw new UserWithSameEmailError()
        }
        
        const passwordHash = await hash(password, 8)
        const emailCode = this.generateEmailCode()

        const temporaryUser = {
            nickname,
            email,
            emailCode,
            password: passwordHash,
            preferredLanguage: preferredLanguage.toUpperCase()
        }

        return {
            temporaryUser
        }
    }

    private generateEmailCode(): string{
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
}