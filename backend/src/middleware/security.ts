import { logger } from "@/utils/logger.js";
import { ForbiddenError } from "@shared/error/forbidden.js";
import { TooManyRequestError } from "@shared/error/tooManyRequest.js";
import { httpArcjet } from "@utils/arcjet.js";
import { asyncHandler } from "@utils/asyncHandler.js";

export const securityMiddleware = asyncHandler(async(req,_res,next) => {

    const decision = await httpArcjet.protect(req);
    if(!decision.isDenied()) return next();
    if(decision.reason.isRateLimit()) {
        logger.error("Security Middleware: Exceed Rate Limit");
        throw new TooManyRequestError("Exceed Rate Limit");
    } 
    if(decision.reason.isBot()) {

        logger.error("Security Middleware: Bot detected");
        throw new ForbiddenError("Bot detected");
    } 
})