import { ENV } from "@/config/env";
import mongoose from 'mongoose'

// const prisma = new PrismaClient({
//     // log only in development
//     log: ENV.NODE_ENV === "development" ? ["query", "error", "warn"] : [],
//     datasources: {
//         db: {
//             url: ENV.DATABASE_URL,
//         },
//     },
// });


class MongoDB {
    constructor() {
    }

    async disconnect() {
        await mongoose.disconnect();
    }

    async connect() {
        await mongoose.connect(ENV.DATABASE_URL).then(() => console.log("Connected to MongoDB"))
            .catch((err) => console.error("Error connecting to MongoDB:", err));
    }
}



const handleShutdown = async () => {
    console.log("Shutting down database connection");
    await mongoose.disconnect();
};

process.on("SIGTERM", handleShutdown);
process.on("SIGINT", handleShutdown);

export default new MongoDB();
