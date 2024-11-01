import amqplib from "amqplib";
import { Queues } from "./rabbitmq/queues";

export async function connectRabbitMQ() {
    const connection = await amqplib.connect("amqp://localhost");
    const channel = await connection.createChannel();

    await channel.assertQueue(Queues.ACCOUNT_CREATION_QUEUE, { durable: true });

    return { connection, channel };
}