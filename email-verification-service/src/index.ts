import { MailerService } from "./config/mailer/mailer";
import { RabbitMQService } from "./config/rabbitmq";
import { RedisService } from "./config/redis";
import { CacheService } from "./config/redis/cache-service";
import { CreateTemporaryUserService } from "./services/verify-email.service";

// Configurações
const AMQP_URI = "amqp://user:password@localhost:5672"
const REDIS_URI = "redis://localhost:6379"; // Substitua conforme necessário

async function initializeService() {
    try {
        // Instância de serviços
        const messageBroker = await RabbitMQService.getInstance(AMQP_URI);
        // const cacheService = new RedisService(REDIS_URI);
        // const mailerService = new MailerService();

        // Instancia e inicia o serviço de criação de usuário temporário
        const createTemporaryUserService = new CreateTemporaryUserService(
            // mailerService,
            messageBroker,
            // cacheService
        );

        await createTemporaryUserService.execute();

        console.log("Serviço de criação de usuário temporário iniciado.");

    } catch (error) {
        console.error("Erro ao inicializar o serviço:", error);
    }
}

initializeService();
