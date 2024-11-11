import { env } from "./config/env";
import { MailerService } from "./config/mailer/mailer";
import { RabbitMQService } from "./config/rabbitmq";
import { RedisService } from "./config/redis";
import { ChangeUserPasswordService } from "./services/change-user-password.service";
import { ConfirmChangeUserPasswordService } from "./services/confirm-change-user-password.service";
import { ConfirmEmailService } from "./services/confirm-email.service";
import { ConfirmNewDeviceToLogService } from "./services/confirm-new-device-to-log.service";
import { NewDeviceTryingLogService } from "./services/new-device-trying-log.service";
import { CreateTemporaryUserService } from "./services/verify-email.service";

const AMQP_URI = env.AMQP_URI
const REDIS_URI = env.REDIS_URI

/**
 * Initializes the email verification service by setting up the necessary services and executing them.
 * 
 * This function performs the following steps:
 * 1. Initializes the RabbitMQ message broker.
 * 2. Initializes the Redis cache service.
 * 3. Initializes the mailer service with SMTP configuration.
 * 4. Creates instances of the following services:
 *    - CreateTemporaryUserService
 *    - ConfirmEmailService
 *    - ChangeUserPasswordService
 *    - ConfirmChangeUserPasswordService
 * 5. Executes the services in the following order:
 *    - confirmEmailService
 *    - createTemporaryUserService
 *    - changeUserPasswordService
 *    - confirmChangeUserPasswordService
 * 
 * If any error occurs during the initialization or execution of the services, it logs the error to the console.
 * 
 * @async
 * @function initializeService
 * @returns {Promise<void>} A promise that resolves when the service is successfully initialized and executed.
 */
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
        const newDeviceTryingToLogError = new NewDeviceTryingLogService(
            mailerService,
            cacheService,
            messageBroker,
        )
        const confirmNewDeviceToLogService = new ConfirmNewDeviceToLogService(
            cacheService,
            messageBroker
        )

        await confirmEmailService.execute();
        await createTemporaryUserService.execute();
        await changeUserPasswordService.execute();
        await confirmChangeUserPasswordService.execute();
        await newDeviceTryingToLogError.execute();
        await confirmNewDeviceToLogService.execute();
        
    } catch (error) {
        console.error("Erro ao inicializar o serviço:", error);
    }
}

initializeService();
