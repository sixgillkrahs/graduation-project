export interface ServiceEndpoint {
  [key: string]: (...args: any[]) => string;
}
