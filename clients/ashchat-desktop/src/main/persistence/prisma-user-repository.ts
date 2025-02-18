import { PrismaClient } from "@prisma/client";
import { UserProfilePropsDTO } from "./DTO/UserProfilePropsDTO";

const prisma = new PrismaClient();
export class PrismaUserRepository {
    public async addUser(data: UserProfilePropsDTO) {
        await prisma.user.create({
            data: {
                nickname: data.nickname,
                photo_url: data.photo_url,
                description: data.description,
                preferred_language: data.preferred_language,
                tag_user_id: data.tag_user_id
            },
        });
    }

    public async updateUser(data: UserProfilePropsDTO) {
        await prisma.user.update({
            where: {
                tag_user_id: data.tag_user_id
            },
            data: {
                nickname: data.nickname,
                photo_url: data.photo_url,
                description: data.description,
                preferred_language: data.preferred_language
            }
        })
    }

    public async getUser() {
        return await prisma.user.findFirst();
    }

    public async deleteAll() {
        await prisma.user.deleteMany()
    }
}