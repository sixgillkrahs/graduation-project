import { UserService } from "@/services/user.service";
import { BaseController } from "./base.controller";
import { NextFunction, Request, Response } from "express";
import { user } from "@prisma/client";
import { Optional } from "@prisma/client/runtime/library";



export class UserController extends BaseController {

    constructor(private userService: UserService) {
        super()
    }

    createUser = (req: Request, res: Response, next: NextFunction) => {
        try {
            this.handleRequest(req, res, next, async () => {
                const { image, firstName, lastName, email, phone } = req.body
                const dataCreate: Optional<user, "id"> = {
                    firstName,
                    lastName,
                    isDeleted: false,
                    email,
                    image: image || "",
                    phone,
                    createAt: new Date(),
                    isActive: true,
                    updatedAt: new Date()
                }
                const userCreated = await this.userService.createUser(dataCreate)
                console.log(userCreated)
                return {
                    message: "Tạo thành công",
                    data: userCreated
                }
            })
        } catch (error) {
            throw error
        }
    }





}