export interface ResponseListSuccess<T> {
  code: number;
  message: string;
  data: {
      hits: T;
      pagination: {
          totalRows: number;
          totalPages: number;
      };
  };
}

export interface ResponseDetailSuccess<T> {
  code: number;
  message: string;
  data: T;
}

export interface ResponseFailure {
  code: number;
  timestamp: string;
  path: string;
  message: string;
  errors: any[];
}