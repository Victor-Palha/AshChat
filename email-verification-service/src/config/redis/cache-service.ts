export abstract class CacheService {
    abstract setEx(key: string, seconds: number, value: string): Promise<void>;
    abstract get(key: string): Promise<string | null>;
    abstract delete(key: string): Promise<void>;
}