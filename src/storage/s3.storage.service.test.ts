import {describe, expect, it, Mock, vi} from "vitest";
import { S3StorageService } from "./s3.storage.service";
import {GetObjectCommand, PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {Readable} from "node:stream";

describe("S3 Storage", () => {

    it("Should upload and retrieve correctly url", async () => {
        vi.mock("node:fs")

        const configuration = {
            send: vi.fn()
        } as unknown as S3Client;

        const service = new S3StorageService({ endpoint: "http://localhost:4566", bucket: "test", client: configuration})

        const response = await service.upload([
            { path: "/tmp/thumb-1.png", name: "Thumb-1" },
            { path: "/tmp/thumb-2.png", name: "Thumb-2" },
        ])

        expect(response).length(2)
        expect(response).containSubset([
            'http://localhost:4566/test/Thumb-1',
            'http://localhost:4566/test/Thumb-2'
        ])
    })


    it('Should retrieve an object from storage', async () => {
        const stream = new Readable({
            read(){
                this.push("content")
                this.push(null)
            }
        });

        const configuration = {
            send: vi.fn().mockResolvedValue({ Body: stream })
        } as unknown as S3Client;

        const service = new S3StorageService({ endpoint: "http://localhost:4566", bucket: "test", client: configuration})

        const response = await service.retrieve("any-key")

        const { input } = (configuration.send as Mock).mock.calls[0][0]

        expect(input.Key).toBe("any-key")
        expect(response.read().toString()).toBe("content")
    });
})
