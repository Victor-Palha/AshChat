import { MessageBroker } from "../config/rabbitmq/messager-broker";
import { Queues } from "../config/rabbitmq/queues";
import { CacheService } from "../config/redis/cache-service";

type ConfirmNewDeviceMessage = {
    emailCode: string;
    user_id: string;
    deviceUniqueToken: string;
}

type ValidateEmailCodeAndUniqueTokenRequest = {
    emailCode: string;
    user_id: string;
    deviceUniqueToken: string;
}

type ValidateEmailCodeAndUniqueTokenResponse = {
    success: boolean;
    message: string;
}

export class ConfirmNewDeviceToLogService {
    constructor(
        private cacheService: CacheService,
        private messageBroker: MessageBroker,
    ) {}

    public async execute(): Promise<void>{
        this.messageBroker.consumeFromQueue(Queues.CONFIRM_NEW_DEVICE_REPLY_QUEUE, async (msg)=> {
            if(!msg) {
                return;
            }

            try {
                const {emailCode, user_id, deviceUniqueToken} = JSON.parse(msg.content.toString()) as ConfirmNewDeviceMessage;
                const response = await this.validateEmailCodeAndUniqueToken({emailCode, user_id, deviceUniqueToken});

                const {replyTo, correlationId} = msg.properties;

                if(replyTo) {
                    await this.messageBroker.sendToQueue(replyTo, JSON.stringify(response), {correlationId});
                }
            } catch (error) {
                console.error("Error processing message:", error);
            }
        })
    }

    private async validateEmailCodeAndUniqueToken({user_id, deviceUniqueToken, emailCode}: ValidateEmailCodeAndUniqueTokenRequest): Promise<ValidateEmailCodeAndUniqueTokenResponse> {
        const cacheUserInfo = await this.cacheService.get(user_id);
        if(!cacheUserInfo) {
            const response = {
                success: false,
                message: "User not found"
            }

            return response;
        }
        const jsonCacheUserInfo = JSON.parse(cacheUserInfo);
        const isEmailCodeValid = jsonCacheUserInfo.emailCode === emailCode;
        const isDeviceUniqueTokenValid = jsonCacheUserInfo.deviceUniqueToken === deviceUniqueToken;

        if(isEmailCodeValid && isDeviceUniqueTokenValid) {
            await this.cacheService.delete(user_id);
            const response = {
                success: true,
                message: "Device successfully confirmed"
            }

            return response;
        }
        const response = {
            success: false,
            message: "Invalid email code or device unique token"
        }
        return response;
    }
}