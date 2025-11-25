import { logger } from "@/config/logger";
import { singleton } from "@/decorators/singleton";
import { PrismaClient, user, Prisma } from "@prisma/client";
import { Optional } from "@prisma/client/runtime/library";


@singleton
export class UserService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    createUser = async (data: Optional<user, "id">, select?: Prisma.userSelect) => {
        return this.prisma.user.create({
            data,
            select: select
        })
    }

    getUserByEmail = async (email: string) => {
        return this.prisma.user.findFirst({
            where: {
                email
            },
        })
    }

    getUserById = async (id: string, select?: Prisma.userSelect) => {
        return this.prisma.user.findFirst({
            where: {
                id
            },
            select: select
        })
    }
}