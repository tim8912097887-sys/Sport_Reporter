import { ApiError, ERROR_CODE, ERROR_TYPE } from "@/shared/error/api.js";

export class ServerConflictError extends ApiError {
    constructor(message: string) {
        super(ERROR_CODE.SERVER_CONFLICT,ERROR_TYPE.SERVER_CONFLICT,message,true);
    }
}