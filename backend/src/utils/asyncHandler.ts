import { RequestHandler } from "express";

export const asyncHandler = (controller: RequestHandler): RequestHandler => (async(req,res,next) => {
    Promise.resolve(controller(req,res,next)).catch(next);
})