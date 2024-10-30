import { Request, Response } from "express";
import { z } from "zod";
import { createNewUserFactory } from "../../domain/factories/create-new-user.factory";
import { UserWithSameEmailError } from "../../domain/use-cases/errors/user-with-same-email-error";


export async function createNewUserController(req: Request, res: Response): Promise<any> {
    const createUserSchema = z.object({
        nickname: z.string(),
        email: z.string().email(),
        password: z.string().min(6),
        preferredLanguage: z.string().length(2)
    })

    const { nickname, email, password, preferredLanguage } = createUserSchema.parse(req.body)

    const service = createNewUserFactory()

    try {
        await service.execute({
            nickname,
            email,
            password,
            preferredLanguage
        })

        return res.status(201).send({
            message: "User created successfully"
        })
        
    } catch (error) {
        if(error instanceof UserWithSameEmailError){
            return res.status(400).send({
                message: error.message
            })
        }
        return res.status(500).send({
            message: "Internal server error"
        })
    }
}