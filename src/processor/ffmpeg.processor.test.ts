import {describe, expect, it, Mock, vi} from "vitest";
import {FFmpegProcessor} from "./ffmpeg.processor";
import ffmpeg from "fluent-ffmpeg";

describe("FFmpeg Processor", () => {

    it("Process should return all generated thumbnails", async () => {
        const thumbs = ['thumb1.png', 'thumb2.png', 'thumb3.png'];

        vi.mock('fluent-ffmpeg', () => {
            const context = {
                on: vi.fn().mockReturnThis(),
                thumbnails: vi.fn().mockReturnThis(),
            }

            return  { default: vi.fn(() => context) }
        })

        const processor = new FFmpegProcessor({ folder: '/tmp/test' });

        (ffmpeg().on as Mock).mockImplementationOnce(
            (event: any, callback: any) => {
                if (event === 'filenames') callback(thumbs);
                return ffmpeg();
            }
        );

        (ffmpeg().on as Mock).mockImplementationOnce(
            (event: any, callback: any) => {
                if (event === 'end') callback();
                return ffmpeg();
            }
        );

        const response = await processor.process("video.mp4")

        expect(response).length(3)
        expect(response).toEqual([
            { name: 'thumb1.png', path: '/tmp/test/thumb1.png' },
            { name: 'thumb2.png', path: '/tmp/test/thumb2.png' },
            { name: 'thumb3.png', path: '/tmp/test/thumb3.png' }
        ])
    })
})