import { User, UserDTO } from "../../entities/user";
import { CreateUserDTO } from "../../use-cases/create-new-user-use-case";
import { UserRepository } from "../user-repository";

export class InMemoryUserRepository implements UserRepository {
    private users: User[] = []

    async createUser(user: CreateUserDTO) {
        const newUser = new User({
            ...user,
            online: false,
            chatsID: [],
            contactsID: []
        })
        this.users.push(...this.users, newUser)

        return newUser
    }

    async addChatToUser(userId: string, chatId: string) {
        const user = this.users.find(user => user.id.getValue === userId) as User
        user.chatsID.push(chatId)
        this.addContactToUser(userId, chatId)
    }

    async addContactToUser(userId: string, contactId: string) {
        const user = this.users.find(user => user.id.getValue === userId) as User
        user.contactsID.push(contactId)
    }

    async findUserByEmail(email: string) {
        const user = this.users.find(user => user.email === email)

        return user
    }

    async findUserById(id: string) {
        const user = this.users.find(user => user.id.getValue === id)

        return user
    }

    async changeStatus(userId: string, online: boolean): Promise<void> {
        const user = this.users.find(user => user.id.getValue === userId)
        if(user){
            user.online = online
        }
    }

    async changePassword(userId: string, newPassword: string): Promise<User> {
        const user = this.users.find(user => user.id.getValue === userId)
        if(user){
            user.password = newPassword
        }
        
        return user as User
    }
}