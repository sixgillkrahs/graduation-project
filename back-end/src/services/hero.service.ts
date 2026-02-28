import { logger } from "@/config/logger";
import { singleton } from "@/decorators/singleton";

@singleton
export class HeroService {
  constructor() {}

  test() {
    return "hello";
  }
}
