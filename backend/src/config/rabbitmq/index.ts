import amqp, { Channel, Connection, Message, Options } from 'amqplib';
import { MessageBroker } from './messager-broker';
import { Queues } from './queues';

/**
 * RabbitMQService is a singleton class that provides methods to interact with RabbitMQ.
 * It implements the MessageBroker interface.
 */
export class RabbitMQService implements MessageBroker {
    /**
     * The singleton instance of RabbitMQService.
     */
    private static instance: RabbitMQService;

    /**
     * The connection to RabbitMQ.
     */
    private connection: Connection | null = null;

    /**
     * The channel for communication with RabbitMQ.
     */
    private channel: Channel | null = null;

    /**
     * Private constructor to prevent direct instantiation.
     * @param uri - The URI for connecting to RabbitMQ.
     */
    private constructor(private uri: string) {}

    /**
     * Returns the singleton instance of RabbitMQService.
     * If the instance does not exist, it creates one and connects to RabbitMQ.
     * @param uri - The URI for connecting to RabbitMQ.
     * @returns The singleton instance of RabbitMQService.
     */
    static async getInstance(uri: string): Promise<RabbitMQService> {
        if (!RabbitMQService.instance) {
            RabbitMQService.instance = new RabbitMQService(uri);
            await RabbitMQService.instance.connect();
        }
        return RabbitMQService.instance;
    }

    /**
     * Connects to RabbitMQ and creates a channel.
     */
    async connect(): Promise<void> {
        this.connection = await amqp.connect(this.uri);
        this.channel = await this.connection.createChannel();
        console.log('Connected to RabbitMQ');
    }

    /**
     * Sends a message to the specified queue.
     * @param queue - The name of the queue.
     * @param message - The message to send.
     * @param options - Optional publish options.
     */
    async sendToQueue(queue: Queues, message: string, options?: Options.Publish): Promise<void> {
        if (!this.channel) throw new Error("RabbitMQ channel is not initialized");
        await this.channel.assertQueue(queue, { durable: true, autoDelete: false });

        this.channel.sendToQueue(
            queue, 
            Buffer.from(message), 
            { 
                persistent: true, 
                ...options 
            }
        );
    }

    /**
     * Consumes messages from the specified queue.
     * @param queue - The name of the queue.
     * @param onMessage - The callback function to handle incoming messages.
     */
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

    /**
     * Creates a new queue with the specified name.
     * If no name is provided, a random name will be generated.
     * @param queueName - The name of the queue.
     * @returns The name of the created queue.
     */
    async createQueue(queueName?: string): Promise<string> {
        if (!this.channel) throw new Error("RabbitMQ channel is not initialized");
        const { queue } = await this.channel.assertQueue(queueName || "", {
            durable: true,
            autoDelete: true,
        });
        return queue;
    }

    /**
     * Acknowledges the specified message.
     * @param message - The message to acknowledge.
     */
    ack(message: Message): void {
        if (!this.channel) throw new Error("RabbitMQ channel is not initialized");
        this.channel.ack(message);
    }

    /**
     * Closes the channel and connection to RabbitMQ.
     */
    async close(): Promise<void> {
        await this.channel?.close();
        await this.connection?.close();
    }
}
