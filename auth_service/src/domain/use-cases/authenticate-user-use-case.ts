import { compare } from "bcryptjs";
import { UserRepository } from "../repositories/user-repository";
import { UserCredentialsError } from "./errors/user-credentials-error";
import { NewDeviceTryingToLogError } from "./errors/new-device-trying-to-log-error";
import { hashDeviceToken } from "../../helper/hash-device-token-helper";

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

        const uniqueTokenHashed = hashDeviceToken(deviceUniqueToken);
        
        if(userExists.devices.deviceUniqueToken !== uniqueTokenHashed){
            throw new NewDeviceTryingToLogError()
        }

        return {
            user_id: userExists.id.getValue
        }
    }
}