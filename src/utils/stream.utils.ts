import { Readable } from "node:stream"

import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'

export async function removeTmpFile(files: string[]) {
    files
        .filter(file => file.startsWith(os.tmpdir()))
        .forEach(file => fs.rmSync(file))
}

export async function streamToTmpFile(stream: Readable): Promise<string> {
    return new Promise((resolve, reject) => {
        const folder = os.tmpdir()
        const file = path.join(folder, `video-${Date.now()}.mp4`)
        const tmp = fs.createWriteStream(file)

        stream.pipe(tmp)
        tmp.on('finish', () => resolve(file))
        tmp.on('error', (error) => reject(error))
    })
}
