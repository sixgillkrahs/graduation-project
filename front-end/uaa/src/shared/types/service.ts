export interface ServiceEndpoint {
  [key: string]: (...args: any[]) => string;
}

export interface IResp<T> {
  success: boolean;
  message: string;
  data: T;
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
  limit: number;
  query?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
