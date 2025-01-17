import { createClient, RedisClientType } from 'redis';
import { CacheService } from './cache-service';

export class RedisService implements CacheService {
    private client: RedisClientType;

    constructor(
        private uri: string
    ) {
        this.client = createClient({
            url: this.uri
        });
        this.client.connect()
            .then(() => console.log('Connected to Redis'))
            .catch((err)=> console.log(err))
    }

    async setItem(key: string, seconds: number, value: any): Promise<void> {
        await this.client.set(
            key,
            value,
            {
                EX: seconds
            }
        );
    }

    async get(key: string): Promise<string | null> {
        return await this.client.get(key);
    }

    async delete(key: string): Promise<void> {
        await this.client.del(key);
    }

    async disconnect(): Promise<void> {
        await this.client.disconnect();
    }
}
