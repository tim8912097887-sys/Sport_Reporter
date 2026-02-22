import { createMatch, getMatches } from "@controllers/match.js";
import { matchChecker } from "@middleware/matchChecker.js";
import { createMatchSchema } from "@validations/match.js";
import express from "express";

export const router = express.Router();

router.get("/",getMatches);

router.post("/",matchChecker(createMatchSchema),createMatch);
