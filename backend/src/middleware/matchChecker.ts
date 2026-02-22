import { ZodObject } from "zod";
import { RequestHandler } from "express";
import { asyncHandler } from "@utils/asyncHandler.js";
import { BadRequestError } from "@shared/error/badRequest.js";

export const matchChecker = (schema: ZodObject): RequestHandler => asyncHandler((req,_,next) => {
      const result = schema.safeParse(req.body);
      if(!result.success) throw new BadRequestError(result.error.issues[0].message);
      // Attach validated data
      req.match = result.data;
      return next();
})