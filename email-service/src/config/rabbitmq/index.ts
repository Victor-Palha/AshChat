import amqp, { Channel, Connection, Message, Options } from 'amqplib';
import { MessageBroker } from './messager-broker';
import { Queues } from './queues';

export class RabbitMQService implements MessageBroker {
    private static instance: RabbitMQService;
    private connection: Connection | null = null;
    private channel: Channel | null = null;

    private constructor(private uri: string) {}

    static async getInstance(uri: string): Promise<RabbitMQService> {
        if (!RabbitMQService.instance) {
            RabbitMQService.instance = new RabbitMQService(uri);
            await RabbitMQService.instance.connect();
        }
        return RabbitMQService.instance;
    }

    async connect(): Promise<void> {
        this.connection = await amqp.connect(this.uri);
        this.channel = await this.connection.createChannel();
        console.log('Connected to RabbitMQ');
    }

    async sendToQueue(queue: Queues, message: string, options?: Options.Publish): Promise<void> {

        if (!this.channel) throw new Error("RabbitMQ channel is not initialized");
        await this.channel.assertQueue(queue, { durable: true, autoDelete: true });

        this.channel.sendToQueue(
            queue, 
            Buffer.from(message), 
            { 
                persistent: true, 
                ...options 
            }
        );
    }

    async consumeFromQueue(queue: Queues, onMessage: (message: Message) => void): Promise<void> {
        if (!this.channel) throw new Error("RabbitMQ channel is not initialized");
        
        await this.channel.assertQueue(queue, {
            durable: true,
            autoDelete: true
        });
        
        this.channel.consume(queue, (msg) => {
            if (msg !== null) {
                onMessage(msg);
                this.channel?.ack(msg);
            }
        }, { noAck: false });
    }

    async createQueue(queueName?: string): Promise<string> {
        if (!this.channel) throw new Error("RabbitMQ channel is not initialized");
        const { queue } = await this.channel.assertQueue(queueName || "", {
            durable: true,
            autoDelete: true,
        });
        return queue;
    }

    ack(message: Message): void {
        if (!this.channel) throw new Error("RabbitMQ channel is not initialized");
        this.channel.ack(message);
    }

    async close(): Promise<void> {
        await this.channel?.close();
        await this.connection?.close();
    }
}
