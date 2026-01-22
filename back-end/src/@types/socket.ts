export type SocketEventAction = (req: {
  body: any;
  header: {
    method: string,
    [k: string]: any
  };
  socket: any
  [k: string]: any;
}) => Promise<{
  code: number;
  state: number;
  data?: any;
  message?: string;
}>;

export interface ISocketEventSetting {
  name: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  action: SocketEventAction;
}
