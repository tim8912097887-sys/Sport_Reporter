import { env } from "@/configs/env.js";
import { db } from "@/db/db.js";
import { matches } from "@/db/schema.js";
import { BadRequestError } from "@/shared/error/badRequest.js"
import { asyncHandler } from "@/utils/asyncHandler.js"
import { getMatchStatus } from "@/utils/matchStatus.js";
import { responseEnvelope } from "@/utils/responseEnvelope.js";
import { listMatchesQuerySchema } from "@/validations/match.js";
import { desc } from "drizzle-orm";

export const getMatches = asyncHandler(async (req, res) => {
    const parsedQuery = listMatchesQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) throw new BadRequestError("Invalid query parameters: " + parsedQuery.error.issues.map(e => e.message).join(", "));
    
    const limit = Math.min(parsedQuery.data.limit ?? 50,env.MAX_LIMIT); 
    const allMatches = await db
                             .select()
                             .from(matches)
                             .orderBy((desc(matches.createAt)))
                             .limit(limit);
    res.status(200).json(responseEnvelope({
        state: "success",
        data: allMatches
    }))
});

export const createMatch = asyncHandler(async (req, res) => {

    if(!req.match) throw new BadRequestError("Validated match data is missing");
    const { startTime, endTime, homeScore, awayScore } = req.match;
    const [event] = await db.insert(matches).values({
        ...req.match,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        homeScore: homeScore ?? 0,
        awayScore: awayScore ?? 0,
        status: getMatchStatus(new Date(startTime), new Date(endTime))
    }).returning();
    if(req.app.locals.broadcastCreatedMatch) req.app.locals.broadcastCreatedMatch(event);
    res.status(201).json(responseEnvelope({
        state: "success",
        data: event
    }))
})