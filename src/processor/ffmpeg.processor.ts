import os from 'node:os'
import path from 'node:path'

import ffmpeg from 'fluent-ffmpeg'
import { Thumbnail, VideoProcessor } from "./video.processor";

const FFmpegDefaultConfiguratio = {
    folder: os.tmpdir()
}

export class FFmpegProcessor implements VideoProcessor {
    #folder: string;

    constructor({ folder } = FFmpegDefaultConfiguratio) {
        this.#folder = folder
    }

    #map(filenames: string[]): Thumbnail[] {
        return filenames.map(filename => ({
            name: filename,
            path: path.join(this.#folder, filename)
        }))
    }

    process(videoPath: string): Promise<Thumbnail[]> {
        return new Promise((resolve, reject) => {
            let thumbnails: Thumbnail[] | null = null
            ffmpeg(videoPath)
                .on('filenames', (filenames) => {
                    thumbnails = this.#map(filenames)
                })
                .on('end', () => resolve(thumbnails!))
                .on('error', (error) => reject(error))
                .thumbnails({ count: 3, folder: '/tmp', filename: '%b_%i' })
        })
    }
}