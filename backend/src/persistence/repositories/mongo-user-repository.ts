// src/repositories/mongodb/user.repository.ts
import { UserRepository } from "../../domain/repositories/user-repository";
import { CreateUserDTO } from "../../domain/use-cases/create-new-user-use-case";
import { UserDocument, UserModel } from "../models/user.model";

export class MongoUserRepository implements UserRepository {

    async createUser(user: CreateUserDTO): Promise<UserDocument> {
        const newUser = new UserModel({
            ...user,
            online: false,
            chatsID: [],
            contactsID: []
        });
        return await newUser.save();
    }

    async addChatToUser(userId: string, chatId: string): Promise<void> {
        await UserModel.findByIdAndUpdate(userId, {
            $addToSet: { chatsID: chatId }
        });
    }

    async addContactToUser(userId: string, contactId: string): Promise<void> {
        await UserModel.findByIdAndUpdate(userId, {
            $addToSet: { contactsID: contactId }
        });
    }

    async findUserByEmail(email: string): Promise<UserDocument | null> {
        return await UserModel.findOne({ email });
    }

    async findUserById(id: string): Promise<UserDocument | null> {
        return await UserModel.findById(id);
    }

    async changeStatus(userId: string, online: boolean): Promise<void> {
        await UserModel.findByIdAndUpdate(userId, { online });
    }
}
