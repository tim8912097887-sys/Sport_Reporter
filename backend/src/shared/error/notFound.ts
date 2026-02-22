import { ApiError, ERROR_CODE, ERROR_TYPE } from "@/shared/error/api.js";

export class NotFoundError extends ApiError {
    constructor(message: string) {
        super(ERROR_CODE.NOT_FOUND,ERROR_TYPE.NOT_FOUND,message,true);
    }
}