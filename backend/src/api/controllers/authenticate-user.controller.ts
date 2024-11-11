import { Request, Response } from "express";
import { z } from "zod";
import { authenticateUserFactory } from "../../domain/factories/authenticate-user.factory";
import { UserCredentialsError } from "../../domain/use-cases/errors/user-credentials-error";
import { generateToken } from "../../helper/generate-token-helper";
import { NewDeviceTryingToLogError } from "../../domain/use-cases/errors/new-device-trying-to-log-error";
import { RabbitMQService } from "../../config/rabbitmq";
import { env } from "../../config/env";
import { Queues } from "../../config/rabbitmq/queues";
import { findUserByEmailFactory } from "../../domain/factories/find-user-by-email.factory";
import { createHash } from "crypto";
import { generateEmailCodeHelper } from "../../helper/generate-email-code-helper";

/**
 * Controller to authenticate a user.
 * 
 * This function handles the HTTP request for user authentication. It validates the request body
 * against a predefined schema, invokes the authentication service, and returns a JWT token if 
 * authentication is successful.
 * 
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 * @returns A promise that resolves to the HTTP response.
 * 
 * @throws {UserCredentialsError} If the provided user credentials are invalid.
 * @throws {Error} For any other internal server errors.
 */
export async function authenticateUserController(req: Request, res: Response): Promise<any> {

    const authenticateUserSchema = z.object({
        email: z.string().email(),
        password: z.string().min(6),
        deviceUniqueToken: z.string().min(1)
    })

    const { email, password, deviceUniqueToken } = authenticateUserSchema.parse(req.body)
    const service = authenticateUserFactory()

    try{
        const {user_id} = await service.execute({
            email,
            password,
            deviceUniqueToken
        })

        const token = generateToken({
            subject: user_id,
            expiresIn: "7d",
            type: "MAIN"
        })

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
        if(error instanceof NewDeviceTryingToLogError){
            const {user} = await findUserByEmailFactory().execute(email)
            const rabbitMQ = await RabbitMQService.getInstance(env.AMQP_URI);
            const tokenHashed = createHash("sha256").update(deviceUniqueToken).digest("hex")
            const emailCode = generateEmailCodeHelper();

            const temporaryToken = generateToken({
                subject: user.id.getValue,
                expiresIn: "5m",
                type: "TEMPORARY"
            })

            await rabbitMQ.sendToQueue(
                Queues.CONFIRM_NEW_DEVICE_QUEUE,
                JSON.stringify({
                    email,
                    emailCode,
                    deviceUniqueToken: tokenHashed,
                    nickname: user.nickname,
                    user_id: user.id.getValue
                })
            )
            return res.status(403).send({
                error: error.message,
                message: "A new device is trying to log in. Check your email to allow it.",
                infor: "To allow the new device, use the JWT temporary token and the code sent to your email to endpoit /api/user/confirm-new-device",
                token: temporaryToken
            })
        }
        return res.status(500).send({
            message: "Internal server error"
        })
    }
}