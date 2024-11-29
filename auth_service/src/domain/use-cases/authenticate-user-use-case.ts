import { compare } from "bcryptjs";
import { UserRepository } from "../repositories/user-repository";
import { UserCredentialsError } from "./errors/user-credentials-error";
import { createHash } from "node:crypto";
import { NewDeviceTryingToLogError } from "./errors/new-device-trying-to-log-error";

type AuthenticateUserDTO = {
    email: string
    password: string
    deviceUniqueToken: string
}

type AuthenticateUserResponse = {
    user_id: string
}

export class AuthenticateUserUseCase {
    constructor(
        private userRepository: UserRepository
    ){}

    async execute({email, password, deviceUniqueToken}: AuthenticateUserDTO): Promise<AuthenticateUserResponse>{
        const userExists = await this.userRepository.findUserByEmail(email)

        if(!userExists){
            throw new UserCredentialsError()
        }
        const passwordMatch = await compare(password, userExists.password)
 
        if(!passwordMatch){
            throw new UserCredentialsError()
        }

        const uniqueTokenHashed = createHash("sha256").update(deviceUniqueToken).digest("hex")
        
        if(userExists.devices.deviceUniqueToken !== uniqueTokenHashed){
            throw new NewDeviceTryingToLogError()
        }

        return {
            user_id: userExists.id.getValue
        }
    }
}