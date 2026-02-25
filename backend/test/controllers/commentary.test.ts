import request from "supertest";
import { env } from "@/configs/env.js";
import { db } from "@/db/db.js";
import { commentary, matches } from "@/db/schema.js";
import { app } from "@/app.js";
import { ERROR_CODE, ERROR_TYPE } from "@/shared/error/api.js";

const createMatches = async(count: number) => {
    const data = Array.from({ length: count }).map((_,i) => {
        return {
            sport: "Soccer",
            homeTeam: `Team A ${i}`,
            awayTeam: `Team B ${i}`,
            startTime: new Date(),
            endTime: new Date(Date.now() + 3600000),
            status: "scheduled" as const,
            // Ensure unique creation times if testing ordering
            createAt: new Date(Date.now() - i * 1000)
        }
    })
    const createdMatches = await db.insert(matches).values(data).returning();
    return createdMatches;
}
// Factory Function for creating mutiple matches
const createComment = async(count: number,matchId: number) => {
    const data = Array.from({ length: count }).map((_,i) => {
        return {
            matchId,
            minute: Math.floor(Math.random()*60+1),
            sequence: 1,
            period: "First Half",
            eventType: "Goal",
            actor: "Lionel Messi"+Math.random().toFixed(5),
            team: "Inter Miami",
            message: "A spectacular strike from outside the box!",
            metadata: { x_coord: 10+i, y_coord: 20+i },
            tags: ["goal", "highlight"],
        }
    })
    const createdMatches = await db.insert(commentary).values(data).returning();
    return createdMatches;
}
// Factory Function for creating match data
// const commentData = (matchId: number) => {
//     return {
//             matchId,
//             minute: Math.floor(Math.random()*60+1),
//             sequence: 1,
//             period: "First Half",
//             eventType: "Goal",
//             actor: "Lionel Messi"+Math.random().toFixed(5),
//             team: "Inter Miami",
//             message: "A spectacular strike from outside the box!",
//             metadata: { x_coord: 10, y_coord: 20 },
//             tags: ["goal", "highlight"],
//         }
// }

describe("Commentary Integration Test",() => {

       const commentObject = {
            id: expect.any(Number),
            matchId: expect.any(Number),
            period: expect.any(String),
            eventType: expect.any(String),
            actor: expect.any(String),
            team: expect.any(String),
            message: expect.any(String),
            tags: expect.any(Array),
            minute: expect.any(Number),
            sequence: expect.any(Number),
        }

    describe("Get Commentary",() => {

        describe("Success",() => {

                    let matchId: number;
                    // Seed the database
                    beforeEach(async() => {
                        // Clean first to ensure a fresh state for THIS file
                        await db.delete(commentary);
                        await db.delete(matches);
                        const createdMatches = await createMatches(1);
                        const createdComment = await createComment(env.MAX_LIMIT,createdMatches[0].id);
                        expect(createdComment.length).toBe(env.MAX_LIMIT);
                        expect(createdMatches.length).toBe(1);
                        matchId = createdMatches[0].id;
                    },10000)

                    it('When query Successfully with 58 comment,should response with 200 Statuscode and 58 comments', async() => {
                                    // Arrange
                                    const LIMIT = 58;
                                    // Act
                                    const response = await request(app)
                                                    .get(`/api/match/${matchId}/commentary/?limit=${LIMIT}`);
                                    // Assertion
                                    expect(response.status).toBe(200);
                                    expect(response.body.error).toBeNull();
                                    expect(response.body.data).toHaveLength(LIMIT);
                                    expect(response.body.data[0]).toMatchObject(commentObject)
                    })
        })

        describe("Fail",() => {
                      it('When query Fail with 110 comments,should response with 400 Statuscode and "Maximum limit is 100" error message', async() => {
                            // Arrange
                            const LIMIT = 110;
                            // Act
                            const response = await request(app)
                                            .get(`/api/match/1/commentary/?limit=${LIMIT}`);
                            // Assertion
                            expect(response.status).toBe(ERROR_CODE.BAD_REQUEST);
                            expect(response.body.data).toBeNull();
                            expect(response.body.error).toMatchObject({
                                status: ERROR_TYPE.BAD_REQUEST,
                                code: ERROR_CODE.BAD_REQUEST,
                                detail: /Maximum limit is 100/i
                            })
                        })
            
                        it('When query Fail with 0 comment,should response with 400 Statuscode and "Limit must be greater than 0" error message', async() => {
                            // Arrange
                            const LIMIT = 0;
                            // Act
                            const response = await request(app)
                                            .get(`/api/match/1/commentary/?limit=${LIMIT}`);
                            // Assertion
                            expect(response.status).toBe(ERROR_CODE.BAD_REQUEST);
                            expect(response.body.data).toBeNull();
                            expect(response.body.error).toMatchObject({
                                status: ERROR_TYPE.BAD_REQUEST,
                                code: ERROR_CODE.BAD_REQUEST,
                                detail: /Limit must be greater than 0/i
                            })
                        })
            
                        it('When query Fail with non-numeric limit,should response with 400 Statuscode and "Limit should be a number" error message', async() => {
                            // Arrange
                            const LIMIT = "sodf";
                            // Act
                            const response = await request(app)
                                            .get(`/api/match/1/commentary/?limit=${LIMIT}`);
                            // Assertion
                            expect(response.status).toBe(ERROR_CODE.BAD_REQUEST);
                            expect(response.body.data).toBeNull();
                            expect(response.body.error).toMatchObject({
                                status: ERROR_TYPE.BAD_REQUEST,
                                code: ERROR_CODE.BAD_REQUEST,
                                detail: /Limit should be a number/i
                            })
                        })
        })

    })
})