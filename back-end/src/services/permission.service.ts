import { singleton } from "@/decorators/singleton";
import { Prisma, PrismaClient } from "@prisma/client";


@singleton
export class PermissionService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    getPermissions = async (limit: number = 10, offset: number = 0, search?: string, sort: {
        field: string;
        order: 'asc' | 'desc';
    } = {
            field: 'id',
            order: 'asc',
        }, select?: Prisma.permissionSelect) => {
        let whereCondition: Prisma.permissionWhereInput = {};
        if (search) {
            whereCondition = {
                name: {
                    contains: search
                }
            }
        }
        const [items, total] = await Promise.all([
            this.prisma.permission.findMany({
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
            this.prisma.permission.count({
                where: whereCondition
            })
        ]);
        const hasNext = offset + limit < total;
        const hasPrev = offset > 0;
        const totalPages = Math.ceil(total / limit);
        const currentPage = Math.floor(offset / limit) + 1;
        return {
            permission: items,
            pagination: {
                hasNext,
                hasPrev,
                totalPages,
                currentPage,
                total,
            },
        };
    }

    getPermissionById = async (id: string, select?: Prisma.permissionSelect) => {
        return this.prisma.permission.findUnique({
            where: {
                id: id.toString(),
            },
            select: select || {
                id: true,
                name: true,
                description: true,
            }
        })
    }

    createPermission = async (data: Prisma.permissionCreateInput) => {
        return this.prisma.permission.create({
            data,
        })
    }
    updatePermission = async (id: string, data: Prisma.permissionUpdateInput) => {
        return this.prisma.permission.update({
            where: {
                id: id.toString(),
            },
            data,
        })
    }

    deletePermission = async (id: string) => {
        return this.prisma.permission.delete({
            where: {
                id: id.toString(),
            },
        })
    }

}