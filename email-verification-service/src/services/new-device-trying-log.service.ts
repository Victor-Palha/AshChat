import { MailerService } from "../config/mailer/mailer";
import { MessageBroker } from "../config/rabbitmq/messager-broker";
import { Queues } from "../config/rabbitmq/queues";
import { CacheService } from "../config/redis/cache-service";

type TemporatySaveUserDeviceInformation = {
    user_id: string;
    deviceUniqueToken: string;
    emailCode: string;
};

export class NewDeviceTryingLogService {
    constructor(
        private mailerService: MailerService,
        private cacheService: CacheService,
        private messageBroker: MessageBroker,
    ) {}

    async execute(): Promise<void> {
        this.messageBroker.consumeFromQueue(Queues.CONFIRM_NEW_DEVICE_QUEUE, async (msg) => {
            const msgToString = (Buffer.from(msg.content).toString());
            const {email, emailCode, deviceUniqueToken, nickname, user_id} = JSON.parse(msgToString);

            this.temporarySaveUserDeviceInformation({user_id, deviceUniqueToken, emailCode})
            .then(async () => {
                await this.mailerService.sendMailToAllowNewDevice({
                    to: email,
                    code: emailCode,
                    who: nickname,
                });
            })
        });
    }

    private async temporarySaveUserDeviceInformation({user_id, deviceUniqueToken, emailCode}: TemporatySaveUserDeviceInformation): Promise<void> {
        const userAlreadyRequested = await this.cacheService.get(user_id);
        if(userAlreadyRequested){
            return;
        }
        const temp_cache = 60 * 5 // 5 minutes
        await this.cacheService.setItem(user_id, temp_cache, JSON.stringify({deviceUniqueToken, emailCode}));
    }
}