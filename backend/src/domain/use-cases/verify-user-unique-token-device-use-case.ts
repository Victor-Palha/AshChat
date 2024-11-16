import { createHash } from "crypto";
import { UserRepository } from "../repositories/user-repository";
import { UserNotFoundError } from "./errors/user-not-found-error";


type VerifyUserDeviceUniqueTokenUseCaseRequest = {
    user_id: string,
    deviceUniqueToken: string
}

type VerifyUserDeviceUniqueTokenUseCaseResponse = {
    isValid: boolean
}
export class VerifyUserDeviceUniqueTokenUseCase{
    constructor(
        private userRepositoy: UserRepository
    ){}

    async execute({user_id, deviceUniqueToken}: VerifyUserDeviceUniqueTokenUseCaseRequest): Promise<VerifyUserDeviceUniqueTokenUseCaseResponse>{
        const userExists = await this.userRepositoy.findUserById(user_id)
        if(!userExists){
            throw new UserNotFoundError()
        }
        const uniqueTokenDevice = userExists.devices.deviceUniqueToken
        const deviceUniqueTokenHashed = createHash('sha256').update(deviceUniqueToken).digest('hex')
        const isValid = uniqueTokenDevice === deviceUniqueTokenHashed
        return {isValid}
    }
}