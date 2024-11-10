import { hash } from "bcryptjs";
import { UserDTO } from "../entities/user";
import { UserRepository } from "../repositories/user-repository";
import { UserWithSameEmailError } from "./errors/user-with-same-email-error";
import { generateEmailCodeHelper } from "../../helper/generate-email-code-helper";

export type CreateTemporatyUserDTO = Omit<UserDTO, 'id' | 'online' | 'chatsID' | 'contactsID' | 'devices'>

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
        const emailCode = generateEmailCodeHelper()

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
}