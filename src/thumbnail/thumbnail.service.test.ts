import {describe, it, vi, expect} from "vitest";
import type { StorageService } from "../storage/storage.service";
import type { VideoProcessor } from "../processor/video.processor";
import { ThumbnailService } from "./thumbnail.service";
import { Readable } from "node:stream";
import {removeTmpFile, streamToTmpFile} from "../utils/stream.utils";

vi.mock("../utils/stream.utils", () => ({
    streamToTmpFile: vi.fn().mockResolvedValue("/mock/path/video.mp4"),
    removeTmpFile: vi.fn()
}))

describe("ThumbnailService", () => {
    it("given a key should process the video", async () => {
        const storage = {
            retrieve: vi.fn().mockResolvedValue(new Readable({
                read() {
                    this.push('video data')
                    this.push(null) // End the stream
                }
            })),
            upload: vi.fn().mockResolvedValue(['https://cdn.com/thumb1.png', 'https://cdn.com/thumb2.png']),
        } as unknown as StorageService

        const processor = {
            process: vi.fn().mockResolvedValue([{ path: '/mock/path/thumb1.png' }, { path: '/mock/path/thumb2.png' }]),
        } as unknown as VideoProcessor

        const service = new ThumbnailService(storage, processor);

        const result = await service.process('video-key')

        // Assertions
        expect(storage.retrieve).toHaveBeenCalledWith('video-key')
        expect(processor.process).toHaveBeenCalledWith('/mock/path/video.mp4')
        expect(removeTmpFile).toHaveBeenCalledWith(['/mock/path/video.mp4', '/mock/path/thumb1.png', '/mock/path/thumb2.png'])
        expect(result).toEqual(['https://cdn.com/thumb1.png', 'https://cdn.com/thumb2.png'])
    })
})