import { User } from "../../domain/entities/user";
import { UserRepository } from "../../domain/repositories/user-repository";
import { CreateUserDTO } from "../../domain/use-cases/create-new-user-use-case";
import { UserMapper } from "../mappers/user-mapper";
import { UserDocument, UserModel } from "../models/user.model";

export class MongoUserRepository implements UserRepository {

    async createUser(user: CreateUserDTO){
        const newUser = new UserModel({
            nickname: user.nickname,
            email: user.email,
            password: user.password,
            preferredLanguage: user.preferredLanguage,
            devices: user.devices,
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

    async changePassword(userId: string, newPassword: string): Promise<User> {
        const userUpdated = await UserModel.findByIdAndUpdate(userId, { password: newPassword }) as UserDocument;
        return UserMapper.toDomain(userUpdated);
    }

    async changeUserDeviceId(userId: string, deviceUniqueToken: string, newDeviceOS: string, newDeviceNotificationToken: string): Promise<void> {
        await UserModel.findByIdAndUpdate(
            userId,
            { 
                "devices.deviceUniqueToken": deviceUniqueToken,
                "devices.deviceOS": newDeviceOS,
                "devices.deviceNotificationToken": newDeviceNotificationToken
            },
            { 
                new: true,
                useFindAndModify: false 
            }
        );
    }
}
