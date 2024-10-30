import { ID } from "./OV/id"

export interface UserDTO {
    id?: string
    nickname: string
    email: string
    password: string
    online: boolean
    preferredLanguage: string
    chatsID: string[]
    contactsID: string[]
}

export class User {
    public id: ID
    public nickname: string
    public email: string
    public password: string
    public online: boolean
    public preferredLanguage: string
    public chatsID: string[]
    public contactsID: string[]

    constructor(dataUser: UserDTO){
        this.id = new ID(dataUser.id)
        this.nickname = dataUser.nickname
        this.email = dataUser.email
        this.password = dataUser.password
        this.online = dataUser.online
        this.preferredLanguage = dataUser.preferredLanguage
        this.chatsID = dataUser.chatsID
        this.contactsID = dataUser.contactsID
    }

    public toDTO(): Omit<UserDTO, 'password'> {
        return {
            id: this.id.getValue,
            nickname: this.nickname,
            email: this.email,
            online: this.online,
            preferredLanguage: this.preferredLanguage,
            chatsID: this.chatsID,
            contactsID: this.contactsID
        }
    }

    public addChat(chatId: string) {
        if (!this.chatsID.includes(chatId)) {
            this.chatsID.push(chatId);
        }
    }
}