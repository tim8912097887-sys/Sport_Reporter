import { env } from "@/configs/env.js";
import { db } from "@/db/db.js";
import { NotFoundError } from "@/shared/error/notFound.js";
import { logger } from "@/utils/logger.js";
import { listCommentaryQuerySchema } from "@/validations/commentary.js";
import { commentary, matches } from "@db/schema.js";
import { BadRequestError } from "@shared/error/badRequest.js"
import { asyncHandler } from "@utils/asyncHandler.js"
import { responseEnvelope } from "@utils/responseEnvelope.js";
import { desc, eq } from "drizzle-orm";

export const createCommentary = asyncHandler(async (req, res) => {

    const { id } = req.params;
    console.log(id);
    if(!id || isNaN(parseInt(id as string))) throw new BadRequestError("Not valid id");
    const matchId = parseInt(id as string);
    const match = await db.select().from(matches).where(eq(matches.id,matchId));
    if(!match.length) {
        logger.warn(`Create Commentary: match with id ${matchId} is not found`);
        throw new NotFoundError("Match not Found")
    } 
    if(!req.commentary) throw new BadRequestError("Validated commentary data is missing");
    const [event] = await db.insert(commentary).values({
        ...req.commentary,
       matchId
    }).returning();
    if(req.app.locals.broadcastComment) req.app.locals.broadcastComment(matchId,event);
    res.status(201).json(responseEnvelope({
        state: "success",
        data: event
    }))
})

export const getComment = asyncHandler(async (req, res) => {
    const parsedQuery = listCommentaryQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) throw new BadRequestError("Invalid query parameters: " + parsedQuery.error.issues.map(e => e.message).join(", "));
    
    const limit = Math.min(parsedQuery.data.limit ?? 50,env.MAX_LIMIT); 
    const { id } = req.params;
    console.log(id);
    if(!id || isNaN(parseInt(id as string))) throw new BadRequestError("Not valid id");
    const matchId = parseInt(id as string);
    const allComments = await db
                             .select()
                             .from(commentary)
                             .where(eq(commentary.matchId,matchId))
                             .orderBy((desc(matches.createAt)))
                             .limit(limit);
    res.status(200).json(responseEnvelope({
        state: "success",
        data: allComments
    }))
});