import { env } from "./config/env";
import { MailerService } from "./config/mailer/mailer";
import { RabbitMQService } from "./config/rabbitmq";
import { RedisService } from "./config/redis";
import { CreateTemporaryUserService } from "./services/verify-email.service";

const AMQP_URI = env.AMQP_URI
const REDIS_URI = env.REDIS_URI

async function initializeService() {
    try {
        const messageBroker = await RabbitMQService.getInstance(AMQP_URI);
        const cacheService = new RedisService(REDIS_URI);
        const mailerService = new MailerService({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            user: env.SMTP_EMAIL,
            pass: env.SMTP_PASSWORD
        
        });

        // Instancia e inicia o serviço de criação de usuário temporário
        const createTemporaryUserService = new CreateTemporaryUserService(
            mailerService,
            messageBroker,
            cacheService
        );

        await createTemporaryUserService.execute();

    } catch (error) {
        console.error("Erro ao inicializar o serviço:", error);
    }
}

initializeService();
