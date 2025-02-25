import { RabbitMQService } from "../queue/rabbitmq.service";
import { ThumbnailService } from "../thumbnail/thumbnail.service";

type VideoUploadedMessage = {
    id: number,
    url: string,
    timestamp: string
}

export class VideoController {
    #rabbit: RabbitMQService = new RabbitMQService()
    #thumbnailService: ThumbnailService = new ThumbnailService()

    static QUEUE_CONFIGURATION = {
        EXCHANGE_NAME: "video.event",
        UPLOAD_QUEUE: "video.processed",
        UPLOAD_ROUTING_KEY: "video.upload",
        THUMBNAIL_QUEUE: "video.thumbnail",
        THUMBNAIL_ROUTING_KEY: "thumbnail.generated",
    }

    async handleProcessThumbnails(video_id: number, key: string) {
        const thumbnails = await this.#thumbnailService.process(key)
        this.handleSendThumbnails(video_id, thumbnails)
    }

    async handleSendThumbnails(video_id: number, thumbnails: string[]) {
        this.#rabbit.send({
            exchange: VideoController.QUEUE_CONFIGURATION.EXCHANGE_NAME,
            routing_key: VideoController.QUEUE_CONFIGURATION.THUMBNAIL_ROUTING_KEY,
            message: {
                video_id,
                urls: thumbnails
            }
        })
    }

    async listenToQueue() {
        await this.#rabbit.setup()

        this.#rabbit.listen<VideoUploadedMessage>(
            VideoController.QUEUE_CONFIGURATION.UPLOAD_QUEUE,
            async ({ id, url }) => await this.handleProcessThumbnails(id, url)
        )
    }

}