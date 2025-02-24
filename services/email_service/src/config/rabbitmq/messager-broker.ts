import { Message, Options } from "amqplib";
import { Queues } from "./queues";

export interface MessageBroker {
    connect(): Promise<void>;

    sendToQueue(queue: Queues, message: string, options?: Options.Publish): Promise<void>;

    consumeFromQueue(queue: Queues, onMessage: (message: Message) => void): Promise<void>;

    createQueue(queueName?: string): Promise<string>;

    ack(message: Message): void;

    close(): Promise<void>;

}