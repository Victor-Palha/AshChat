import { User } from "../entities/user";
import { CreateUserDTO } from "../use-cases/create-new-user-use-case";

export abstract class UserRepository {
  abstract findUserById(id: string): Promise<User | null | undefined>;
  abstract findUserByEmail(email: string): Promise<User | null | undefined>;
  abstract createUser(user: CreateUserDTO): Promise<User>;
  abstract addChatToUser(userId: string, chatId: string): Promise<void>;
  abstract addContactToUser(userId: string, contactId: string): Promise<void>;
  abstract changeStatus(userId: string, online: boolean): Promise<void>
  abstract changePassword(userId: string, newPassword: string): Promise<User>
  abstract changeUserDeviceId(userId: string, newDeviceId: string, newDeviceOS: string, newDeviceNotificationToken: string): Promise<void>
}