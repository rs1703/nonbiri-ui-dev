interface HttpResponse<T> {
  statusCode: number;
  content: T;
}
