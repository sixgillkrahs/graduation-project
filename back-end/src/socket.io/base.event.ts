import { processResponse } from "@/middleware/processingSocket";

export abstract class BaseEvent {
  protected async handleRequest(
    req: any,
    action: () => Promise<{
      code: number;
      state: number;
      data?: any;
      message?: string;
    }>,
  ): Promise<any> {
    try {
      const result = await action();
      return processResponse(result);
    } catch (error) {
      throw error;
    }
  }
}
