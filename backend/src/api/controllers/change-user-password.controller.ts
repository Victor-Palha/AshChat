import { Request, Response } from "express";
import { z, ZodError } from "zod";
import { findUserByEmailFactory } from "../../domain/factories/find-user-by-email.factory";
import { UserNotFoundError } from "../../domain/use-cases/errors/user-not-found-error";
import { RabbitMQService } from "../../config/rabbitmq";
import { env } from "../../config/env";
import { Queues } from "../../config/rabbitmq/queues";
import { generateEmailCodeHelper } from "../../helper/generate-email-code-helper";
import { generateToken } from "../../helper/generate-token-helper";


/**
 * Controller to handle the change user password request.
 * 
 * This controller validates the request body to ensure it contains a valid email,
 * finds the user by email, generates a temporary token and an email verification code,
 * and sends a message to the RabbitMQ queue to process the password change.
 * 
 * @param req - The request object containing the email in the body.
 * @param res - The response object used to send back the appropriate HTTP response.
 * 
 * @returns A response with status 202 if the verification email is being processed,
 *          status 404 if the user is not found,
 *          status 400 if the request body is invalid,
 *          or status 500 for any other internal server error.
 * 
 * @throws UserNotFoundError - If the user is not found by the provided email.
 * @throws ZodError - If the request body validation fails.
 */
export async function changeUserPasswordController(req: Request, res: Response): Promise<any>{
    const changeUserPasswordSchema = z.object({
        email: z.string().email(),
    });

    const { email } = changeUserPasswordSchema.parse(req.body);
    const service = findUserByEmailFactory();
    try {
        const { user } = await service.execute(email);

        const rabbitMQ = await RabbitMQService.getInstance(env.AMQP_URI);
        const emailCode = generateEmailCodeHelper();
        const expiresIn = (10 * 60 * 1000).toString(); // 10 minutes
        const temporaryToken = generateToken({
            expiresIn,
            subject: user.id.getValue,
            type: "TEMPORARY"
        });

        await rabbitMQ.sendToQueue(
            Queues.CHANGE_PASSWORD_QUEUE,
            JSON.stringify({ 
                email: user.email, 
                user_id: user.id.getValue,
                nickname: user.nickname,
                emailCode
            })
        )

        return res.status(202).send({
            message: "Verification email is being processed",
            temporaryToken
        });

    } catch (error) {
        if(error instanceof UserNotFoundError){
            return res.status(404).json({ message: error.message });
        }
        if(error instanceof ZodError){
            return res.status(400).json({ message: error.errors });
        }

        return res.status(500).json({ message: "Internal Server Error" });
    }
}