import fs from 'node:fs'

import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { StorageService } from "./storage.service";
import type { Readable } from "node:stream";
import { Thumbnail } from '../processor/video.processor';


const S3LocalConfiguration = {
    endpoint: "http://localhost:4566",
    credentials: {
        accessKeyId: "local",
        secretAccessKey: "stack",
    },
    bucket: "shotit"
}

export class S3StorageService implements StorageService {
    #endpoint: string;
    #client: S3Client;
    #bucket: string;

    constructor({ endpoint, credentials, bucket } = S3LocalConfiguration) {
        this.#endpoint = endpoint
        this.#client = new S3Client({
            endpoint,
            forcePathStyle: true,
            credentials
        })
        this.#bucket = bucket
    }

    async upload(files: Thumbnail[]): Promise<string[]> {
        const uploaded = await Promise.allSettled(files.map(file => this.#sendToS3(file)))
        const success = uploaded.filter(promise => promise.status === 'fulfilled')

        if (success.length > 0) {
            return success.map(thumbnail => thumbnail.value)
        }

        return Promise.reject("Failed to Upload")
    }

    async #buildS3Url(thumbnail: Thumbnail) {
        return `${this.#endpoint}/${this.#bucket}/${thumbnail.name}`
    }

    async #sendToS3(thumbnail: Thumbnail) {
        const request = new PutObjectCommand({
            Bucket: this.#bucket,
            Key: thumbnail.name,
            Body: fs.createReadStream(thumbnail.path)
        })

        await this.#client.send(request)

        return this.#buildS3Url(thumbnail)
    }

    async retrieve(file: string) {
        const request = new GetObjectCommand({
            Bucket: this.#bucket,
            Key: file
        })

        const response = await this.#client.send(request)

        return (response.Body as Readable) ?? null
    }
}