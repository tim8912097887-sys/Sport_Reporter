import { ApiError, ERROR_CODE, ERROR_TYPE } from "@/shared/error/api.js";

export class ForbiddenError extends ApiError {
    constructor(message: string) {
        super(ERROR_CODE.FORBIDDEN,ERROR_TYPE.FORBIDDEN,message,true);
    }
}