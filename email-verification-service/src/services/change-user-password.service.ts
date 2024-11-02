import { MailerService } from "../config/mailer/mailer";
import { MessageBroker } from "../config/rabbitmq/messager-broker";
import { Queues } from "../config/rabbitmq/queues";
import { CacheService } from "../config/redis/cache-service";

export class ChangeUserPasswordService {
    constructor(
        private mailerService: MailerService,
        private messageBroker: MessageBroker,
        private cacheService: CacheService
    ) {}

    async execute(): Promise<void> {
        this.messageBroker.consumeFromQueue(Queues.CHANGE_PASSWORD_QUEUE, async (msg) => {
            const msgToString = (Buffer.from(msg.content).toString());
            const {email, user_id, nickname, emailCode} = JSON.parse(msgToString);
            const temp_cache = 60 * 10 // 10 minutes

            this.cacheService.setItem(
                user_id, 
                temp_cache,
                JSON.stringify({user_id, emailCode})
            )

            .then(async () => {
                await this.mailerService.sendMailToChangePassword({
                    to: email,
                    code: emailCode,
                    who: nickname,
                });
            })
        });
    }
}