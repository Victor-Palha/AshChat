import { MailerService } from "../config/mailer/mailer";
import { MessageBroker } from "../config/rabbitmq/messager-broker";
import { Queues } from "../config/rabbitmq/queues";
import { CacheService } from "../config/redis/cache-service";

export class CreateTemporaryUserService {
    constructor(
        // private mailerService: MailerService,
        private messageBroker: MessageBroker,
        // private cacheService: CacheService
    ) {}

    async execute(): Promise<void> {
        await this.messageBroker.connect();

        this.messageBroker.consumeFromQueue(Queues.ACCOUNT_CREATION_QUEUE, async (msg) => {
            console.log('Received message:', msg);
        });

        console.log('Serviço de criação de usuário temporário iniciado e escutando a fila "account_creation_queue"');
    }
}