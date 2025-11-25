import { singleton } from "@/decorators/singleton";
import { Prisma, PrismaClient } from "@prisma/client";


@singleton
export class OperationService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    getOperations = async (limit: number = 10, offset: number = 0, search?: string, sort: {
        field: string;
        order: 'asc' | 'desc';
    } = {
            field: 'id',
            order: 'asc',
        }, select?: Prisma.operationSelect) => {
        let whereCondition: Prisma.operationWhereInput = {};
        if (search) {
            whereCondition = {
                name: {
                    contains: search
                }
            }
        }
        const [items, total] = await Promise.all([
            this.prisma.operation.findMany({
                take: limit,
                skip: offset,
                orderBy: {
                    [sort.field]: sort.order,
                },
                select: select || {
                    id: true,
                    name: true,
                    description: true,
                }
            }),
            this.prisma.operation.count({
                where: whereCondition
            })
        ]);
        const hasNext = offset + limit < total;
        const hasPrev = offset > 0;
        const totalPages = Math.ceil(total / limit);
        const currentPage = Math.floor(offset / limit) + 1;
        return {
            operation: items,
            pagination: {
                hasNext,
                hasPrev,
                totalPages,
                currentPage,
                total,
            },
        };
    }

    getOperationById = async (id: string, select?: Prisma.operationSelect) => {
        return this.prisma.operation.findUnique({
            where: {
                id: Number(id),
            },
            select: select || {
                id: true,
                name: true,
                description: true,
            }
        })
    }

}