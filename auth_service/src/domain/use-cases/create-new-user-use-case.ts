import { UserDTO } from "../entities/user";
import { UserRepository } from "../repositories/user-repository";
import { UserWithSameEmailError } from "./errors/user-with-same-email-error";
import { Hash, createHash } from "crypto";

export type CreateUserDTO = Omit<UserDTO, 'id' | 'online' | 'chatsID' | 'contactsID'>
type CreateUserResponse = Omit<UserDTO, 'password' | 'online' | 'chatsID'| 'contactsID'>

export class CreateNewUserUseCase {
    constructor(private userRepository: UserRepository){}

    async execute({nickname, email, password, preferredLanguage, devices}: CreateUserDTO): Promise<CreateUserResponse>{
        const userWithSameEmailExists = await this.userRepository.findUserByEmail(email)

        if(userWithSameEmailExists){
            throw new UserWithSameEmailError()
        }

        const uniqueDeviceToken = createHash('sha256').update(devices.deviceUniqueToken).digest('hex')

        const newUser = await this.userRepository.createUser({
            nickname, 
            email, 
            password,
            preferredLanguage: preferredLanguage.toUpperCase(),
            devices: {
                deviceOS: devices.deviceOS,
                deviceUniqueToken: uniqueDeviceToken,
                deviceNotificationToken: devices.deviceNotificationToken
            }
        })

        const userResponse: CreateUserResponse = {
            id: newUser.id.getValue,
            nickname: newUser.nickname,
            email: newUser.email,
            preferredLanguage: newUser.preferredLanguage,
            devices: newUser.devices
        }
        
        return userResponse
    }
}