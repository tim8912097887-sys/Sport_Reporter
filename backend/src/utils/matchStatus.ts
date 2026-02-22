import { MATCH_STATUS } from "@/validations/match.js";

export const getMatchStatus = (startTime: Date, endTime: Date): "scheduled" | "live" | "finished" => {
    const now = new Date();
    if (now < startTime) return MATCH_STATUS.SCHEDULED;

    if (now >= startTime && now <= endTime) return MATCH_STATUS.LIVE;
    return MATCH_STATUS.FINISHED;
}