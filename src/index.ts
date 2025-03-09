import { VideoController } from "./controller/video.controller"
import {ThumbnailService} from "./thumbnail/thumbnail.service";
import {S3StorageService} from "./storage/s3.storage.service";
import {FFmpegProcessor} from "./processor/ffmpeg.processor";
import amqp from "amqplib";
import {RabbitMQService} from "./queue/rabbitmq.service";

async function main() {
    const {
        NODE_QUEUE_HOST
    } = process.env;

    const service = new ThumbnailService(
        new S3StorageService(),
        new FFmpegProcessor()
    )

    const rabbit = await amqp.connect(`amqp://${NODE_QUEUE_HOST ?? 'localhost'}`)

    const channel = await rabbit.createChannel()

    const queue = new RabbitMQService(channel)

    const controller = new VideoController(queue, service)
    await controller.listenToQueue()
}

main().catch(console.error)
