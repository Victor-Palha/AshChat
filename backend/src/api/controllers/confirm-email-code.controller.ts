import { Request, Response } from "express";
import { z } from "zod";
import { createNewUserFactory } from "../../domain/factories/create-new-user.factory";
import { RabbitMQService } from "../../config/rabbitmq/index";
import { env } from "../../config/env";
import { Queues } from "../../config/rabbitmq/queues";
import { randomUUID } from "crypto";
import { UserWithSameEmailError } from "../../domain/use-cases/errors/user-with-same-email-error";

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
                        message: "Já existe um usuário com o e-mail informado"
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
