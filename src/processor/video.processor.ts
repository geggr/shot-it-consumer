export type Thumbnail = {
    name: string
    path: string
}

export interface VideoProcessor {
    process(path: string): Promise<Thumbnail[]>
}