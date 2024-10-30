import { UserRepository } from "../../domain/repositories/user-repository";
import { CreateUserDTO } from "../../domain/use-cases/create-new-user-use-case";
import { UserMapper } from "../mappers/user-mapper";
import { UserModel } from "../models/user.model";

export class MongoUserRepository implements UserRepository {

    async createUser(user: CreateUserDTO){
        const newUser = new UserModel({
            ...user,
            online: false,
            chatsID: [],
            contactsID: []
        });
        await newUser.save();
        return UserMapper.toDomain(newUser);
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

    async findUserByEmail(email: string) {
        const user = await UserModel.findOne({ email });
        return user ? UserMapper.toDomain(user) : null
    }

    async findUserById(id: string) {
        const user = await UserModel.findById(id);
        return user ? UserMapper.toDomain(user) : null;
    }

    async changeStatus(userId: string, online: boolean): Promise<void> {
        await UserModel.findByIdAndUpdate(userId, { online });
    }
}
