import amqp from 'amqplib'

type RabbitMQQueueSetup = {
    queue: string
    exchange: string
    routing: string
}

type RabbitMQMessage = {
    exchange: string
    routing_key: string
    message: object
}

export class RabbitMQService {
    #channel: amqp.Channel

    constructor(channel: amqp.Channel) {
        this.#channel = channel;
    }

    async createQueueWithBinding({ queue, exchange, routing }: RabbitMQQueueSetup) {
        await this.#channel.assertExchange(exchange, 'direct', { durable: true });
        await this.#channel.assertQueue(queue, { durable: true });
        await this.#channel.bindQueue(queue, exchange, routing);
    }

    async send({ exchange, routing_key, message }: RabbitMQMessage) {
        const buffer = Buffer.from(JSON.stringify(message));
        this.#channel.publish(exchange, routing_key, buffer);
    }

    async listen<T>(queue: string, consumer: (data: T) => void) {
        this.#channel.consume(queue, (message) => {
            if (message === null) return;
            try {
                console.log(message)
                const content = message.content.toString();
                consumer(JSON.parse(content));
            } catch (error) {
                console.log(error);
            }
            finally {
                this.#channel.ack(message);
            }
        });
    }
}