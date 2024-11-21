import { RabbitMQService } from "../config/rabbitmq";
import { Queues } from "../config/rabbitmq/queues";
import { CacheService } from "../config/redis/cache-service";

interface ConfirmChangeUserPassword {
    emailCode: string;
    user_id: string;
}

export class ConfirmChangeUserPasswordService {
    constructor(
        private messageBroker: RabbitMQService,
        private cacheService: CacheService,
    ){}

    async execute(){
        await this.messageBroker.consumeFromQueue(Queues.CONFIRM_CHANGE_PASSWORD_QUEUE, async (msg) => {
            if (!msg) return;

            try {
                const { emailCode, user_id } = JSON.parse(msg.content.toString()) as ConfirmChangeUserPassword;
                const response = await this.validateEmailCode(user_id, emailCode);

                const { replyTo, correlationId } = msg.properties;
                if (replyTo) {
                    await this.messageBroker.sendToQueue(replyTo, JSON.stringify(response), { correlationId });
                }

            } catch (error) {
                console.error("Error processing message:", error);
            }
        });
    }

    private async validateEmailCode(user_id: string, emailCode: string){
        const cachedEmailCode = await this.cacheService.get(user_id);
        
        if(!cachedEmailCode){
            return {
                success: false,
                message: "Código de e-mail não encontrado"
            }
        }

        const jsonCacheEmailCode = JSON.parse(cachedEmailCode);
        const isValid = jsonCacheEmailCode.emailCode === emailCode;
        const message = isValid ? "Código de e-mail confirmado com sucesso" : "Código de e-mail inválido";
        const response = { 
            success: isValid, 
            message,
        };

        if (isValid) {
            await this.cacheService.delete(user_id);
        }

        return response;
    }
}