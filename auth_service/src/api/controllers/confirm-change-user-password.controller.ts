import { Request, Response } from "express";
import { z, ZodError } from "zod";
import { UserNotFoundError } from "../../domain/use-cases/errors/user-not-found-error";
import { RabbitMQService } from "../../config/rabbitmq";
import { env } from "../../config/env";
import { Queues } from "../../config/rabbitmq/queues";
import { randomUUID } from "crypto";
import { changeUserPasswordFactory } from "../../domain/factories/change-user-password.factory";

/**
 * Controller to confirm the change of a user's password.
 * 
 * This function handles the request to confirm a user's password change by validating the provided
 * email code and new password, sending a message to a RabbitMQ queue, and updating the user's password
 * if the response is successful.
 * 
 * @param req - The request object containing the email code and new password in the body.
 * @param res - The response object used to send the HTTP response.
 * @returns A promise that resolves to an HTTP response.
 * 
 * @throws {UserNotFoundError} If the user is not found.
 * @throws {ZodError} If the request body validation fails.
 * @throws {Error} If there is a timeout waiting for the RabbitMQ response or any other internal server error.
 */
export async function confirmChangeUserPasswordController(req: Request, res: Response): Promise<any>{
    const changeUserPasswordSchema = z.object({
        emailCode: z.string().min(6),
        newPassword: z.string().min(6)
    });

    const { emailCode, newPassword } = changeUserPasswordSchema.parse(req.body);
    const {sub} = req.user_id;
    const service = changeUserPasswordFactory();
    try {

        const rabbitMQ = await RabbitMQService.getInstance(env.AMQP_URI);
        const replyQueueName = `${Queues.CONFIRM_CHANGE_PASSWORD_REPLY_QUEUE}-`+randomUUID();
        const replyQueue = await rabbitMQ.createQueue(replyQueueName);
        const correlationId = randomUUID();

        await rabbitMQ.sendToQueue(
            Queues.CONFIRM_CHANGE_PASSWORD_QUEUE,
            JSON.stringify({emailCode, user_id: sub}),
            { correlationId, replyTo: replyQueue }
        )

        const response = await new Promise((resolve, reject) => {
            const consumeHandler = async (msg: any) => {
                if (msg && msg.properties.correlationId === correlationId) {
                    resolve(JSON.parse(msg.content.toString()));
                }
            };

            rabbitMQ.consumeFromQueue(replyQueue as Queues, consumeHandler);

            setTimeout(() => {
                reject(new Error("Timeout to wait for response"));
            }, 5000);
        }) as any;

        if(response.success){
            try {
                await service.execute({
                    user_id: sub, 
                    new_password: newPassword
                });
                
                return res.status(204).send();
            } catch (error) {
                if(error instanceof UserNotFoundError){
                    return res.status(404).json({ message: error.message });
                }
            }
        }

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