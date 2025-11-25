import { logger } from "@/config/logger";
import { singleton } from "@/decorators/singleton";
import uuid from 'uuid'


@singleton
export class HeroService {

    constructor() {
    }

    test() {
        return "hello"
    }
}