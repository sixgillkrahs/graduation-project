export interface ServiceEndpoint {
  [key: string]: (...args: any[]) => string;
}

export interface IPaginationResp<T> {
  success: boolean;
  message: string;
  data: IPagination<T>;
}

export interface IPagination<T> {
  results: T[];
  totalPages: number;
  totalResults: number;
  page: number;
  limit: number;
}

export interface IParamsPagination {
  page: number;
  size: number;
}
