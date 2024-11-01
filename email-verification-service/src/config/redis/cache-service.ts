export abstract class CacheService {
    abstract setItem(key: string, seconds: number, value: string): Promise<void>;
    abstract get(key: string): Promise<string | null>;
    abstract delete(key: string): Promise<void>;
}