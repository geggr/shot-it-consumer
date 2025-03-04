import {describe, expect, it, vi} from "vitest";
import {VideoController} from "./video.controller";
import {RabbitMQService} from "../queue/rabbitmq.service";
import {ThumbnailService} from "../thumbnail/thumbnail.service";

describe("Video Controller", () => {
    it("should process a new video", async () => {
        const message = {
            video_id: 1,
            key: 'video.mp4'
        }

        const queue = {
            send: vi.fn()
        } as unknown as RabbitMQService

        const service = {
            process: vi.fn().mockResolvedValue(["thumb-1", "thumb-2", "thumb-3"])
        } as unknown as ThumbnailService

        const controller = new VideoController(queue, service)

        await controller.handleProcessThumbnails(message.video_id, message.key)

        expect(service.process).toHaveBeenCalledWith(message.key)
        expect(queue.send).toHaveBeenCalledWith({
            exchange: 'video.event',
            routing_key: 'thumbnail.generated',
            message: {
                video_id: message.video_id,
                urls: ["thumb-1", "thumb-2", "thumb-3"]
            }
        })
    })

    it("should listen to queue", async () => {
        const queue = {
            listen: vi.fn()
        } as unknown as RabbitMQService

        const service = {
            process: vi.fn().mockResolvedValue(["thumb-1", "thumb-2", "thumb-3"])
        } as unknown as ThumbnailService

        const controller = new VideoController(queue, service)

        await controller.listenToQueue()

        expect(queue.listen).toHaveBeenCalledOnce()
    })
})