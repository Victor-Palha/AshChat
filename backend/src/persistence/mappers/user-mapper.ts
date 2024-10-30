import { User } from "../../domain/entities/user";
import { UserDocument } from "../models/user.model";

export class UserMapper {
    static toDomain(userDocument: UserDocument): User {
        return new User({
            id: userDocument.id,
            nickname: userDocument.nickname,
            email: userDocument.email,
            password: userDocument.password,
            online: userDocument.online,
            preferredLanguage: userDocument.preferredLanguage,
            chatsID: userDocument.chatsID,
            contactsID: userDocument.contactsID,
        });
    }
    
    static toDTO(user: User): UserDocument {
        return {
            id: user.id,
            nickname: user.nickname,
            email: user.email,
            password: user.password,
            online: user.online,
            preferredLanguage: user.preferredLanguage,
            chatsID: user.chatsID,
            contactsID: user.contactsID,
        } as UserDocument;
    }
}