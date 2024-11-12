import { Request, Response } from "express";
import { confirmNewDeviceFactory } from "../../domain/factories/confirm-new-device.factory";
import { UserNotFoundError } from "../../domain/use-cases/errors/user-not-found-error";
import { z } from "zod";
import { env } from "../../config/env";
import { RabbitMQService } from "../../config/rabbitmq";
import { Queues } from "../../config/rabbitmq/queues";
import { createHash, randomUUID } from "crypto";

export async function confirmNewDeviceController(req: Request, res: Response): Promise<any> {
    const confirmNewDeviceSchema = z.object({
        emailCode: z.coerce.string(),
        deviceUniqueToken: z.string().min(1),
        deviceOS: z.string().min(1),
        deviceNotificationToken: z.string().min(1),
    })

    const { emailCode, deviceUniqueToken, deviceOS, deviceNotificationToken } = confirmNewDeviceSchema.parse(req.body);
    const {sub} = req.user_id

    try {
        const rabbitMQ = await RabbitMQService.getInstance(env.AMQP_URI);
        const replyQueueName = `${Queues.CONFIRM_NEW_DEVICE_REPLY_QUEUE}-`+randomUUID();
        const replyQueue = await rabbitMQ.createQueue(replyQueueName);
        const correlationId = randomUUID();
        const deviceUniqueTokenHashed = createHash("sha256").update(deviceUniqueToken).digest("hex");

        await rabbitMQ.sendToQueue(
            Queues.CONFIRM_NEW_DEVICE_REPLY_QUEUE,
            JSON.stringify({ emailCode, user_id: sub, deviceUniqueToken: deviceUniqueTokenHashed }),
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
            const service = confirmNewDeviceFactory();
            await service.execute({
                userId: sub,
                newDeviceId: deviceUniqueToken,
                deviceOS,
                deviceNotificationToken
            });

            return res.status(204).json();
        }
        if(response.success === false){
            return res.status(403).json({ message: response.message });
        }
    } catch (error) {
        if(error instanceof UserNotFoundError){
            return res.status(404).json({ message: error.message });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}