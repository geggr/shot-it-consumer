import {test, expect, vi, it, describe} from 'vitest';

import fs, {WriteStream} from 'node:fs'
import os from 'node:os'

import {removeTmpFile, streamToTmpFile} from "./stream.utils";
import {Readable, Writable} from "node:stream";

describe("Remove Temporary Files", () => {
    it('Should remove only files inside /tmp/ folder', () => {
        vi.spyOn(os, 'tmpdir').mockReturnValue("/tmp")

        vi.mock('node:fs')

        const spy = vi.spyOn(fs, 'rmSync')

        removeTmpFile([
            "/os/file1.txt",
            "/tmp/file2.txt",
            "/tmp/file3.txt"
        ])

        expect(spy).toHaveBeenCalledTimes(2)
    });
})

describe("Stream to Temporary Files", () => {
    it('Create a file inside /tmp folder', async () => {
        vi.spyOn(os, 'tmpdir').mockReturnValue("/tmp")

        const stream = new Writable({
            write: (chunk, enconding, callback) => callback()
        })

        // @ts-ignore
        vi.spyOn(fs, 'createWriteStream').mockReturnValue(stream)

        const readable = new Readable({
            read(){
                this.push("some data")
                this.push(null)
            }
        })

        setImmediate(() => readable.emit('finish'))

        const response = await streamToTmpFile(readable)

        expect(response).toMatch(/^\/tmp\/video-\d+\.mp4$/)
    });
})
