import { env } from "./config/env";
import { MailerService } from "./config/mailer/mailer";
import { RabbitMQService } from "./config/rabbitmq";
import { RedisService } from "./config/redis";
import { ChangeUserPasswordService } from "./services/change-user-password.service";
import { ConfirmChangeUserPasswordService } from "./services/confirm-change-user-password.service";
import { ConfirmEmailService } from "./services/confirm-email.service";
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

        const createTemporaryUserService = new CreateTemporaryUserService(
            mailerService,
            messageBroker,
            cacheService
        );
        const confirmEmailService = new ConfirmEmailService(
            messageBroker,
            cacheService
        )
        const changeUserPasswordService = new ChangeUserPasswordService(
            mailerService,
            messageBroker,
            cacheService
        )
        const confirmChangeUserPasswordService = new ConfirmChangeUserPasswordService(
            messageBroker,
            cacheService
        )

        await confirmEmailService.execute();
        await createTemporaryUserService.execute();
        await changeUserPasswordService.execute();
        await confirmChangeUserPasswordService.execute();
        
    } catch (error) {
        console.error("Erro ao inicializar o serviço:", error);
    }
}

initializeService();
