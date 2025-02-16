export interface response<ResponseType = Array<any> | object | undefined> {
  statusCode: number;
  response?: ResponseType;
  message: string;
}

export interface PaginationResponse<listType> {
  data: listType[];
  pagination: {
    pageNumber: number;
    limit: number;
    total: number;
  };
}

export interface AuthUserInterface {
  userId: number;
  email: string;
}
