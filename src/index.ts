import { VideoController } from "./controller/video.controller"

async function main() {
    const controller = new VideoController()
    await controller.listenToQueue()
}

main()