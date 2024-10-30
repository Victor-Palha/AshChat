import { compare } from "bcryptjs";
import { UserRepository } from "../repositories/user-repository";
import { UserCredentialsError } from "./errors/user-credentials-error";

type AuthenticateUserDTO = {
    email: string
    password: string
}

type AuthenticateUserResponse = {
    user_id: string
}

export class AuthenticateUserUseCase {
    constructor(
        private userRepository: UserRepository
    ){}

    async execute({email, password}: AuthenticateUserDTO): Promise<AuthenticateUserResponse>{
        const userExists = await this.userRepository.findUserByEmail(email)

        if(!userExists){
            throw new UserCredentialsError()
        }

        const passwordMatch = await compare(password, userExists.password)
 
        if(!passwordMatch){
            throw new UserCredentialsError()
        }

        return {
            user_id: userExists.id.getValue
        }
    }
}