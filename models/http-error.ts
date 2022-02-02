class HttpError extends Error {
  code: string;
  constructor(message: string, errorCode: string) {
    super(message); //add a 'message' property from built in error
    this.code = errorCode;
  }
}
export default HttpError;
