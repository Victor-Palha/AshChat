import { MailerService } from "../config/mailer/mailer";
import { MessageBroker } from "../config/rabbitmq/messager-broker";
import { Queues } from "../config/rabbitmq/queues";
import { CacheService } from "../config/redis/cache-service";

/**
 * Service to handle user password change requests.
 * 
 * This service listens to a message queue for password change requests,
 * caches the request details, and sends an email to the user with a code
 * to change their password.
 * 
 * @class ChangeUserPasswordService
 * 
 * @param {MailerService} mailerService - Service to send emails.
 * @param {MessageBroker} messageBroker - Service to handle message queue operations.
 * @param {CacheService} cacheService - Service to handle caching operations.
 * 
 * @method execute - Consumes messages from the password change queue, caches the request details,
 * and sends an email to the user with a code to change their password.
 * 
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
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