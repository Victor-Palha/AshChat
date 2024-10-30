import { UserDTO } from "../entities/user";
import { UserRepository } from "../repositories/user-repository";
import { UserWithSameEmailError } from "./errors/user-with-same-email-error";
import {hash} from 'bcryptjs'

export type CreateUserDTO = Omit<UserDTO, 'id' | 'online' | 'chatsID' | 'contactsID'>
type CreateUserResponse = Omit<UserDTO, 'password' | 'online' | 'chatsID'| 'contactsID'>

export class CreateNewUserUseCase {
    constructor(private userRepository: UserRepository){}

    async execute({nickname, email, password, preferredLanguage}: CreateUserDTO): Promise<CreateUserResponse>{
        const userWithSameEmailExists = await this.userRepository.findUserByEmail(email)

        if(userWithSameEmailExists){
            throw new UserWithSameEmailError()
        }
        const passwordHash = await hash(password, 8)

        const newUser = await this.userRepository.createUser({
            nickname, 
            email, 
            password: passwordHash, 
            preferredLanguage: preferredLanguage.toUpperCase()
        })

        const userResponse: CreateUserResponse = {
            id: newUser.id.getValue,
            nickname: newUser.nickname,
            email: newUser.email,
            preferredLanguage: newUser.preferredLanguage
        }
        
        return userResponse
    }
}