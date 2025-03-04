import { RabbitMQService } from "../queue/rabbitmq.service";
import { ThumbnailService } from "../thumbnail/thumbnail.service";

type VideoUploadedMessage = {
    id: number,
    url: string,
    timestamp: string
}

export class VideoController {
    #queue: RabbitMQService;
    #thumbnailService: ThumbnailService

    static QUEUE_CONFIGURATION = {
        EXCHANGE_NAME: "video.event",
        UPLOAD_QUEUE: "video.processed",
        UPLOAD_ROUTING_KEY: "video.upload",
        THUMBNAIL_QUEUE: "video.thumbnail",
        THUMBNAIL_ROUTING_KEY: "thumbnail.generated",
    }

    constructor(queue: RabbitMQService, thumbnailService: ThumbnailService) {
        this.#queue = queue
        this.#thumbnailService = thumbnailService
    }

    async handleProcessThumbnails(video_id: number, key: string) {
        const thumbnails = await this.#thumbnailService.process(key)
        this.handleSendThumbnails(video_id, thumbnails).catch(console.error)
    }

    async handleSendThumbnails(video_id: number, thumbnails: string[]) {
        this.#queue.send({
            exchange: VideoController.QUEUE_CONFIGURATION.EXCHANGE_NAME,
            routing_key: VideoController.QUEUE_CONFIGURATION.THUMBNAIL_ROUTING_KEY,
            message: {
                video_id,
                urls: thumbnails
            }
        })
    }

    async listenToQueue() {
        this.#queue.listen<VideoUploadedMessage>(
            VideoController.QUEUE_CONFIGURATION.UPLOAD_QUEUE,
            async ({ id, url }) => await this.handleProcessThumbnails(id, url)
        )
        .catch(console.error)
    }

}