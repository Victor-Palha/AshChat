import { Request, Response } from "express";
import { z } from "zod";
import { createNewUserFactory } from "../../domain/factories/create-new-user.factory";
import { RabbitMQService } from "../../config/rabbitmq/index";
import { env } from "../../config/env";
import { Queues } from "../../config/rabbitmq/queues";
import { randomUUID } from "crypto";
import { UserWithSameEmailError } from "../../domain/use-cases/errors/user-with-same-email-error";

/**
 * Controller to confirm the email code.
 * 
 * This function validates the email and email code from the request body,
 * sends the data to a RabbitMQ queue, and waits for a response. If the response
 * indicates success, it creates a new user with the provided data. If the response
 * indicates failure or if an error occurs, it sends an appropriate error response.
 * 
 * @param req - The request object containing the email and email code in the body.
 * @param res - The response object used to send the response back to the client.
 * @returns A promise that resolves to the response sent to the client.
 * 
 * @throws Will throw an error if the RabbitMQ service instance cannot be created,
 *         if there is a timeout waiting for the RabbitMQ response, or if there is
 *         an error creating the new user.
 */
export async function confirmEmailCodeController(req: Request, res: Response): Promise<any> {

    const confirmEmailCodeSchema = z.object({
        email: z.string().email(),
        emailCode: z.string().min(6)
    });

    const { email, emailCode } = confirmEmailCodeSchema.parse(req.body);

    const service = createNewUserFactory();
    try {
        const rabbitMQ = await RabbitMQService.getInstance(env.AMQP_URI);
        const replyQueueName = `${Queues.CONFIRM_EMAIL_CODE_REPLY_QUEUE}-`+randomUUID();
        const replyQueue = await rabbitMQ.createQueue(replyQueueName);
        const correlationId = randomUUID();

        await rabbitMQ.sendToQueue(
            Queues.CONFIRM_EMAIL_CODE_QUEUE,
            JSON.stringify({ email, emailCode }),
            { correlationId, replyTo: replyQueue }
        );

        const response = await new Promise((resolve, reject) => {
            const consumeHandler = async (msg: any) => {
                if (msg && msg.properties.correlationId === correlationId) {
                    resolve(JSON.parse(msg.content.toString()));
                }
            };

            rabbitMQ.consumeFromQueue(replyQueue as Queues, consumeHandler);

            setTimeout(() => {
                reject(new Error("Timeout ao aguardar resposta"));
            }, 5000);
        }) as any;

        if(response.success){
            const { email, nickname, password, preferredLanguage } = response.data;

            try {
                const user = await service.execute({ email, nickname, password, preferredLanguage });
                return res.status(201).json(user);
            } catch (error) {
                if(error instanceof UserWithSameEmailError){
                    return res.status(400).json({
                        message: error.message
                    });
                }
            }
        }

        if(!response.success){
            return res.status(400).json(response.message);
        }

    } catch (error) {
        console.error("Erro ao confirmar código de e-mail:", error);
        return res.status(500).send({
            message: "Erro interno no servidor ao confirmar o código de e-mail"
        });
    }
}
