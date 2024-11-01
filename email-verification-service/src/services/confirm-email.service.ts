import { MessageBroker } from "../config/rabbitmq/messager-broker";
import { Queues } from "../config/rabbitmq/queues";
import { CacheService } from "../config/redis/cache-service";

type ConfirmEmailMessage = {
    email: string;
    emailCode: string;
};

export class ConfirmEmailService {
    constructor(
        private messageBroker: MessageBroker,
        private cacheService: CacheService
    ) {}

    async execute(): Promise<void> {
        await this.messageBroker.consumeFromQueue(Queues.CONFIRM_EMAIL_CODE_QUEUE, async (msg) => {
            if (!msg) return;

            try {
                const { email, emailCode } = JSON.parse(msg.content.toString()) as ConfirmEmailMessage;
                console.log("Email code received:", emailCode);

                const cacheUserInfo = await this.cacheService.get(email);

                if (!cacheUserInfo) {
                    console.log(`No cache info found for email: ${email}`);
                    return;
                }

                const jsonCacheUserInfo = JSON.parse(cacheUserInfo);
                const isValid = jsonCacheUserInfo.emailCode === emailCode;

                const response = { 
                    success: isValid, 
                    email
                };

                const { replyTo, correlationId } = msg.properties;
                console.log("Replying to:", replyTo, "with correlationId:", correlationId);
                if (replyTo) {
                    await this.messageBroker.sendToQueue(replyTo, JSON.stringify(response), { correlationId });
                }

            } catch (error) {
                console.error("Error processing message:", error);
            }
        });

        console.log('Serviço de confirmação de e-mail iniciado e escutando a fila "confirm_email_code_queue"');
    }
}
