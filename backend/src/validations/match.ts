import z from "zod";

export const MATCH_STATUS = {
    SCHEDULED: "scheduled",
    LIVE: "live",
    FINISHED: "finished",
} as const; // Added 'as const' for better type inference

export const listMatchesQuerySchema = z.object({
    limit: z.coerce
        .number("Limit should be a number")
        .int()
        .positive("Limit must be greater than 0")
        .max(100, "Maximum limit is 100")
        .optional(),
});

export const matchIdParamSchema = z.object({
    id: z.coerce
        .number({ error: "ID must be a valid number" })
        .int()
        .positive("ID must be a positive integer"),
});

const isoDateString = z.iso.datetime({ message: "Invalid ISO date format" });

export const createMatchSchema = z.object({
    sport: z.string("sport should be string").min(1, "Sport name is required"),
    homeTeam: z.string("homeTeam should be string").min(1, "Home team name is required"),
    awayTeam: z.string("awayTeam should be string").min(1, "Away team name is required"),
    startTime: isoDateString,
    endTime: isoDateString,
    homeScore: z.coerce
        .number("homeScore should be number")
        .int()
        .nonnegative("Score cannot be negative")
        .optional(),
    awayScore: z.coerce
        .number("awayScore should be number")
        .int()
        .nonnegative("Score cannot be negative")
        .optional(),
}).superRefine(({ startTime, endTime }, ctx) => {
    // Convert strings to Date objects for accurate comparison
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
        ctx.addIssue({
            code: "custom",
            message: "The match cannot end before it starts (startTime must be before endTime)",
            path: ["endTime"]
        });
    }
});

export type CreateMatchType = z.infer<typeof createMatchSchema>;