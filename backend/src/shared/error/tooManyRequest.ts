import { ApiError, ERROR_CODE, ERROR_TYPE } from "@/shared/error/api.js";

export class TooManyRequestError extends ApiError {
    constructor(message: string) {
        super(ERROR_CODE.TOO_MANY_REQUEST,ERROR_TYPE.TOO_MANY_REQUEST,message,true);
    }
}