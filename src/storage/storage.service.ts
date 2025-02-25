import { Readable } from "node:stream"
import { Thumbnail } from "../processor/video.processor"

export type UploadResponse = {
    success: string[],
    fail: string[]
}

export interface StorageService {
    upload(files: Thumbnail[]): Promise<string[]>
    retrieve(file: string): Promise<Readable>
}