export abstract class MessageBroker {
    abstract connect(): Promise<void>;
    abstract sendToQueue(queue: string, message: string): Promise<void>;
    abstract consumeFromQueue(queue: string, onMessage: (message: string) => void): Promise<void>;
    abstract close(): Promise<void>;
}