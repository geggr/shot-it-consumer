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
    #connection: amqp.Connection
    #channel: amqp.Channel

    async #connect() {
        this.#connection = await amqp.connect("amqp://localhost")
        this.#channel = await this.#connection.createChannel()
    }

    async createQueueWithBinding({ queue, exchange, routing }: RabbitMQQueueSetup) {
        await this.#channel.assertExchange(exchange, 'direct', { durable: true })
        await this.#channel.assertQueue(queue, { durable: true })
        await this.#channel.bindQueue(queue, exchange, routing)
    }

    async setup() {
        await this.#connect()
    }

    async send({ exchange, routing_key, message }: RabbitMQMessage) {
        const buffer = Buffer.from(JSON.stringify(message))
        this.#channel.publish(exchange, routing_key, buffer)
    }

    async listen<T>(queue: string, consumer: (data: T) => void) {
        this.#channel.consume(queue, (message) => {
            if (message === null) return

            try {
                const content = message.content.toString()
                consumer(JSON.parse(content))
                this.#channel.ack(message)
            }
            catch (error) {
                console.log(error)
            }
        })
    }
}