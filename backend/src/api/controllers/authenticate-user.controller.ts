import { Request, Response } from "express";
import { z } from "zod";
import { authenticateUserFactory } from "../../domain/factories/authenticate-user.factory";
import { UserCredentialsError } from "../../domain/use-cases/errors/user-credentials-error";
import { sign } from "jsonwebtoken";
import { env } from "../../config/env";

export async function authenticateUserController(req: Request, res: Response): Promise<any> {
    const authenticateUserSchema = z.object({
        email: z.string().email(),
        password: z.string().min(6)
    })

    const { email, password } = authenticateUserSchema.parse(req.body)
    const service = authenticateUserFactory()

    try{
        const {user_id} = await service.execute({
            email,
            password
        })

        const token = sign(
            {},
            env.JWT_SECRET,
            {
                subject: user_id,
                expiresIn: "1d"
            }
        )

        return res.status(200).send({
            token
        })
    }
    catch(error){
        if(error instanceof UserCredentialsError){
            return res.status(401).send({
                message: error.message
            })
        }
        return res.status(500).send({
            message: "Internal server error"
        })
    }
}