import { responseEnvelope } from "@utils/responseEnvelope.js";
import { ERROR_CODE, ERROR_TYPE } from "@shared/error/api.js";

export const notFoundHandler = (_req: any, res: any) => {
    res.status(404).json(responseEnvelope({
        state: "error",
        error: {
            status: ERROR_TYPE.NOT_FOUND,
            code: ERROR_CODE.NOT_FOUND,
            detail: "The requested resource was not found."
        }
    }))
}