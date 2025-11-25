import cluster from "cluster";
import os from "os";
import { logger } from "@/config/logger";

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
    logger.info(`Primary process ${process.pid} is running`);
    logger.info(`Starting ${numCPUs} workers...`);

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on("exit", (worker, code, signal) => {
        logger.warn(
            `Worker ${worker.process.pid} died (${signal || code}). Restarting...`
        );
        cluster.fork();
    });

    const shutdownMaster = () => {
        logger.info("Master shutting down, stopping all workers...");
        for (const id in cluster.workers) {
            cluster.workers[id]?.send("shutdown");
        }
    };

    process.on("SIGINT", shutdownMaster);
    process.on("SIGTERM", shutdownMaster);

} else {
    import(".");
}
