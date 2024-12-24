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
 * This function handles the authentication of a user by validating the request body,
 * executing the authentication service, and generating a token if successful. It also
 * handles specific errors related to user credentials and new device login attempts.
 * 
 * @param req - The request object containing the user credentials and device unique token.
 * @param res - The response object used to send back the appropriate response.
 * @returns A promise that resolves to the response object with the authentication token or an error message.
 * 
 * @throws {UserCredentialsError} If the user credentials are invalid.
 * @throws {NewDeviceTryingToLogError} If a new device is trying to log in.
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

        const refresh_token = generateToken({
            subject: user_id,
            expiresIn: "7d",
            type: "REFRESH"
        })

        const token = generateToken({
            subject: user_id,
            expiresIn: "30m",
            type: "MAIN"
        })

        return res.status(200).send({
            refresh_token,
            token,
            user_id
        })
    }
    catch(error){
        console.log(error)
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
                info: "To allow the new device, use the JWT temporary token and the code sent to your email to endpoit /api/user/confirm-new-device",
                token: temporaryToken
            })
        }
        return res.status(500).send({
            message: "Internal server error"
        })
    }
}