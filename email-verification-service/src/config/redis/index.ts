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
        this.client.connect().then(() => console.log('Connected to Redis'));
    }

    async setEx(key: string, seconds: number, value: string): Promise<void> {
        await this.client.setEx(key, seconds, value);
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
