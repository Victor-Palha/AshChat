import { MessageBroker } from "../config/rabbitmq/messager-broker";
import { Queues } from "../config/rabbitmq/queues";
import { CacheService } from "../config/redis/cache-service";

type ConfirmEmailMessage = {
    email: string;
    emailCode: string;
};

type ConfirmEmailServiceResponse = {
    success: boolean;
    message: string;
    data?: {
        email: string;
        nickname: string;
        password: string;
        preferredLanguage: string;
    }
}
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
                const response = await this.validateEmailCode(email, emailCode);

                const { replyTo, correlationId } = msg.properties;
                if (replyTo) {
                    await this.messageBroker.sendToQueue(replyTo, JSON.stringify(response), { correlationId });
                }

            } catch (error) {
                console.error("Error processing message:", error);
            }
        });
        console.log('Serviço de confirmação de e-mail iniciado e escutando a fila "confirm_email_code_queue"');
    }


    private async validateEmailCode(email: string, emailCode: string): Promise<ConfirmEmailServiceResponse> {
        const cacheUserInfo = await this.cacheService.get(email);

        if (!cacheUserInfo) {
            return {
                success: false,
                message: "E-mail não encontrado",
                data: undefined
            }
        }

        const jsonCacheUserInfo = JSON.parse(cacheUserInfo);
        const isValid = jsonCacheUserInfo.emailCode === emailCode;
        const message = isValid ? "Código de e-mail confirmado com sucesso" : "Código de e-mail inválido";
        const response = { 
            success: isValid, 
            message,
            data: isValid ? {
                email: jsonCacheUserInfo.email,
                nickname: jsonCacheUserInfo.nickname,
                password: jsonCacheUserInfo.password,
                preferredLanguage: jsonCacheUserInfo.preferredLanguage
            } : undefined
        };

        if (isValid) {
            await this.cacheService.delete(email);
        }

        return response;
    }
}
