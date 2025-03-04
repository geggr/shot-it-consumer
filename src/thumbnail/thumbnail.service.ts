import { removeTmpFile, streamToTmpFile } from "../utils/stream.utils"
import { VideoProcessor } from "../processor/video.processor"
import { StorageService } from "../storage/storage.service"

export class ThumbnailService {
    #storage: StorageService
    #processor: VideoProcessor

    constructor(storage: StorageService, processor: VideoProcessor) {
        this.#storage = storage
        this.#processor = processor
    }

    async process(key: string) {
        const readable = await this.#storage.retrieve(key)
        const video = await streamToTmpFile(readable)
        const thumbnails = await this.#processor.process(video)
        const uploaded = await this.#storage.upload(thumbnails)
        removeTmpFile([video, ...thumbnails.map(it => it.path)])
        return uploaded
    }
}