import { singleton } from "@/decorators/singleton";
import { LoginBody } from "@/models/auth.model";
import { AppError } from "@/utils/appError";
import { ErrorCode } from "@/utils/errorCodes";
import { PrismaClient, Prisma } from "@prisma/client";
import { Optional } from "@prisma/client/runtime/library";


@singleton
export class AuthService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async getAuthByUsername(username: string) {
        return this.prisma.userAuth.findFirst({
            where: {
                username: username
            }
        })
    }

    async createAuth(auth: Optional<Prisma.userAuthCreateInput, "createAt" | "updatedAt" | "id">) {
        return this.prisma.userAuth.create({
            data: {
                ...auth,
                createAt: new Date(),
                updatedAt: new Date(),
            }
        })
    }
}