import { Request, Response } from "express";
import { z } from "zod";
import { UserWithSameEmailError } from "../../domain/use-cases/errors/user-with-same-email-error";
import { createTemporaryUserFactory } from "../../domain/factories/create-temporary-user.factory";
import { RabbitMQService } from "../../config/rabbitmq/index"; // Certifique-se de ajustar o caminho
import { Queues } from "../../config/rabbitmq/queues";
import { env } from "../../config/env";

/**
 * Controller to handle the creation of a new user.
 * 
 * This function validates the request body against a schema, creates a temporary user,
 * and sends a message to the account creation queue for further processing.
 * 
 * @param req - The request object containing the user data.
 * @param res - The response object to send the result.
 * @returns A promise that resolves to the response object.
 * 
 * @throws UserWithSameEmailError - If a user with the same email already exists.
 * @throws Error - For any other internal server errors.
 */
export async function createNewUserController(req: Request, res: Response): Promise<any> {
    const createUserSchema = z.object({
        nickname: z.string(),
        email: z.string().email(),
        password: z.string().min(6),
        preferredLanguage: z.string().length(2)
    });

    const { nickname, email, password, preferredLanguage } = createUserSchema.parse(req.body);

    const service = createTemporaryUserFactory();

    try {
        const { temporaryUser } = await service.execute({
            nickname,
            email,
            password,
            preferredLanguage
        });

        const rabbitMQ = await RabbitMQService.getInstance(env.AMQP_URI);
        
        await rabbitMQ.sendToQueue(
            Queues.ACCOUNT_CREATION_QUEUE,
            JSON.stringify({ 
                email: temporaryUser.email, 
                emailCode: temporaryUser.emailCode, 
                nickname: temporaryUser.nickname, 
                password: temporaryUser.password, 
                preferredLanguage: temporaryUser.preferredLanguage
            })
        );

        return res.status(202).send({ 
            message: "Verification email is being processed" 
        });
        
    } catch (error) {
        if (error instanceof UserWithSameEmailError) {
            return res.status(400).send({
                message: error.message
            });
        }
        return res.status(500).send({
            message: "Internal server error"
        });
    }
}
