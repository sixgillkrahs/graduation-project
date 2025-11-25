import { HeroService } from "@/services/hero.service";
import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";



export class HeroController extends BaseController {

    constructor(private heroService: HeroService) {
        super()
    }

    test = (req: Request, res: Response, next: NextFunction) => {
        this.handleRequest(req, res, next, async () => {
            return this.heroService.test()
        })
    }





}