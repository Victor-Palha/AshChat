import { MailerService } from "../config/mailer/mailer";
import { MessageBroker } from "../config/rabbitmq/messager-broker";
import { Queues } from "../config/rabbitmq/queues";
import { CacheService } from "../config/redis/cache-service";

/**
 * Service to create a temporary user and send a verification email.
 * 
 * This service listens to the ACCOUNT_CREATION_QUEUE, processes the incoming messages,
 * stores the user data in a cache for a temporary period, and sends a verification email
 * to the user.
 * 
 * @class CreateTemporaryUserService
 * @constructor
 * @param {MailerService} mailerService - Service to send emails.
 * @param {MessageBroker} messageBroker - Service to handle message queue operations.
 * @param {CacheService} cacheService - Service to handle caching operations.
 * 
 * @method execute
 * @async
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
export class CreateTemporaryUserService {
    constructor(
        private mailerService: MailerService,
        private messageBroker: MessageBroker,
        private cacheService: CacheService
    ) {}

    async execute(): Promise<void> {
        this.messageBroker.consumeFromQueue(Queues.ACCOUNT_CREATION_QUEUE, async (msg) => {
            const msgToString = (Buffer.from(msg.content).toString());
            const {email, emailCode, nickname, password, preferredLanguage} = JSON.parse(msgToString);

            const temp_cache = 60 * 10 // 10 minutes

            this.cacheService.setItem(
                email, 
                temp_cache,
                JSON.stringify({email, emailCode, nickname, password, preferredLanguage})
            )
            .then(async () => {
                // await this.mailerService.sendMailToRegister({
                //     to: email,
                //     code: emailCode,
                //     who: nickname,
                // });
            })
        });
    }
}