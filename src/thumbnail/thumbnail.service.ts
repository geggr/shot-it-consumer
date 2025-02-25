import { removeTmpFile, streamToTmpFile } from "../utils/stream.utils"
import { FFmpegProcessor } from "../processor/ffmpeg.processor"
import { VideoProcessor } from "../processor/video.processor"
import { S3StorageService } from "../storage/s3.storage.service"
import { StorageService } from "../storage/storage.service"

export class ThumbnailService {
    #storage: StorageService = new S3StorageService()
    #processor: VideoProcessor = new FFmpegProcessor()

    async process(key: string) {
        const readable = await this.#storage.retrieve(key)
        const video = await streamToTmpFile(readable)
        const thumbnails = await this.#processor.process(video)
        const uploaded = await this.#storage.upload(thumbnails)
        removeTmpFile([video, ...thumbnails.map(it => it.path)])
        return uploaded
    }
}