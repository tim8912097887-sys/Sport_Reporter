import express from "express";
import { createCommentary, getComment } from "@controllers/commentary.js";
import { commentaryChecker } from "@middleware/commentaryChecker.js";
import { createCommentarySchema } from "@validations/commentary.js";

export const router = express.Router({ mergeParams: true }); // Get the param from above route

router.get("/",getComment);
router.post("/",commentaryChecker(createCommentarySchema),createCommentary);