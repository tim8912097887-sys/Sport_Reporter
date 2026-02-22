import { ApiError, ERROR_CODE, ERROR_TYPE } from "@/shared/error/api.js";

export class ServerError extends ApiError {
    constructor(message: string) {
        super(ERROR_CODE.SERVER_ERROR,ERROR_TYPE.SERVER_ERROR,message,true);
    }
}