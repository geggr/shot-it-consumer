export interface QueueConsumer<T> {
    consume(content: T): Promise<void>
}