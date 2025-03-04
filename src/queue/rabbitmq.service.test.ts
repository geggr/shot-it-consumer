import {describe, expect, it, Mock, vi} from "vitest";
import {RabbitMQService} from "./rabbitmq.service";
import amqp from "amqplib";

describe("RabbitMQ Service", () => {

    it("should connect correctly to a exchange", async () => {
        const channel = {
            assertExchange: vi.fn(),
            assertQueue: vi.fn(),
            bindQueue: vi.fn()
        } as unknown as amqp.Channel

        const service = new RabbitMQService(channel)

        await service.createQueueWithBinding({
            queue: 'test',
            routing: 'events',
            exchange: 'exchange-test'
        })

        expect(channel.assertExchange).toHaveBeenCalledWith('exchange-test', 'direct', { durable: true })
        expect(channel.assertQueue).toHaveBeenCalledWith('test', { durable: true })
        expect(channel.bindQueue).toHaveBeenCalledWith('test', 'exchange-test', 'events')
    })

    it('should send a message to correctly queue', async () => {
        const channel = {
            publish: vi.fn()
        } as unknown as amqp.Channel

        const service = new RabbitMQService(channel)

        await service.send({
            exchange: 'exchange-test',
            message: {
                hello: 'world'
            },
            routing_key: 'events.created'
        })

        expect(channel.publish)
            .toHaveBeenCalledWith(
                'exchange-test',
                'events.created',
                Buffer.from(JSON.stringify({hello: 'world'}), 'utf8'),
            )
    });

    it('should listen and process a message', async () => {
        const content = Buffer.from(
            JSON.stringify({
                hello: 'world'
            }),
            'utf8'
        )

        const message = { content }

        const channel = {
            consume: vi.fn().mockImplementation(
                (_queue, callback) => callback(message)
            ),
            ack: vi.fn()
        } as unknown as amqp.Channel

        const service = new RabbitMQService(channel)

        const consumer = (target: object) => Object.keys(target)

        await service.listen('test', consumer)

        expect(channel.consume).toBeCalledTimes(1)
        expect(channel.ack).toBeCalledTimes(1)
    });

    it('should do nothing if message is null', async () => {
        const message = null

        const channel = {
            consume: vi.fn().mockImplementation(
                (_queue, callback) => callback(message)
            ),
            ack: vi.fn()
        } as unknown as amqp.Channel

        const service = new RabbitMQService(channel)

        const consumer = (target: object) => Object.keys(target)

        await service.listen('test', consumer)

        expect(channel.consume).toBeCalledTimes(1)
        expect(channel.ack).not.toBeCalledTimes(1)
    });
})