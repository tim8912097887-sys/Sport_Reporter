import request from "supertest";
import { commentary, matches } from "@db/schema.js";
import { db } from "@db/db.js"
import { app } from "@/app.js";
import { env } from "@/configs/env.js";
import { ERROR_CODE, ERROR_TYPE } from "@/shared/error/api.js";

// Factory Function for creating mutiple matches
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
// Factory Function for creating match data
const matchData = () => {
    return {
            sport: "Soccer",
            homeTeam: `Team A ${Math.random().toFixed(5)}`,
            awayTeam: `Team B ${Math.random().toFixed(5)}`,
            startTime: new Date(),
            endTime: new Date(Date.now() + 3600000),
            status: "scheduled" as const,
            // Ensure unique creation times if testing ordering
            createAt: new Date(Date.now())
        }
}

describe("Match Integration Test",() => {

    const matchObject = {
        id: expect.any(Number),
        sport: expect.any(String),
        homeTeam: expect.any(String),
        awayTeam: expect.any(String),
        startTime: expect.any(String),
        endTime: expect.any(String),
        homeScore: expect.any(Number),
        awayScore: expect.any(Number),
    }

    describe("Get Match",() => {
        
        describe("Success",() => {

            // Seed the database
            beforeEach(async() => {
                 // Clean first to ensure a fresh state for THIS file
                await db.delete(commentary);
                await db.delete(matches);
                const createdMatches = await createMatches(env.MAX_LIMIT);
                expect(createdMatches.length).toBe(env.MAX_LIMIT);
            },10000)
            it('When query Successfully with 58 matches,should response with 200 Statuscode and 58 matches', async() => {
                // Arrange
                const LIMIT = 58;
                // Act
                const response = await request(app)
                                .get(`/api/matches/?limit=${LIMIT}`);
                // Assertion
                expect(response.status).toBe(200);
                expect(response.body.error).toBeNull();
                expect(response.body.data).toHaveLength(LIMIT);
                expect(response.body.data[0]).toMatchObject(matchObject)
            })
        })

        describe("Fail",() => {

            it('When query Fail with 110 matches,should response with 400 Statuscode and "Maximum limit is 100" error message', async() => {
                // Arrange
                const LIMIT = 110;
                // Act
                const response = await request(app)
                                .get(`/api/matches/?limit=${LIMIT}`);
                // Assertion
                expect(response.status).toBe(ERROR_CODE.BAD_REQUEST);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: ERROR_TYPE.BAD_REQUEST,
                    code: ERROR_CODE.BAD_REQUEST,
                    detail: /Maximum limit is 100/i
                })
            })

            it('When query Fail with 0 matches,should response with 400 Statuscode and "Limit must be greater than 0" error message', async() => {
                // Arrange
                const LIMIT = 0;
                // Act
                const response = await request(app)
                                .get(`/api/matches/?limit=${LIMIT}`);
                // Assertion
                expect(response.status).toBe(ERROR_CODE.BAD_REQUEST);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: ERROR_TYPE.BAD_REQUEST,
                    code: ERROR_CODE.BAD_REQUEST,
                    detail: /Limit must be greater than 0/i
                })
            })

            it('When query Fail with non-numeric,should response with 400 Statuscode and "Limit should be a number" error message', async() => {
                // Arrange
                const LIMIT = "sodf";
                // Act
                const response = await request(app)
                                .get(`/api/matches/?limit=${LIMIT}`);
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

    describe("Create Match",() => {

        describe("Fail",() => {
            // Sport
            it('When provide empty string to sport,should response with 400 StatusCode and "Sport name is required" error message', async() => {
                // Arrange
                const invalidData = { ...matchData(),sport: ""};
                // Act
                const response = await request(app)
                                .post(`/api/matches/`)
                                .send(invalidData);
                // Assertion
                expect(response.status).toBe(ERROR_CODE.BAD_REQUEST);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: ERROR_TYPE.BAD_REQUEST,
                    code: ERROR_CODE.BAD_REQUEST,
                    detail: /Sport name is required/i
                })
            })

            it('When provide non-string to sport,should response with 400 StatusCode and "sport should be string" error message', async() => {
                // Arrange
                const invalidData = { ...matchData(),sport: 5};
                // Act
                const response = await request(app)
                                .post(`/api/matches/`)
                                .send(invalidData);
                // Assertion
                expect(response.status).toBe(ERROR_CODE.BAD_REQUEST);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: ERROR_TYPE.BAD_REQUEST,
                    code: ERROR_CODE.BAD_REQUEST,
                    detail: /sport should be string/i
                })
            })
            // homeTeam
            it('When provide empty string to homeTeam,should response with 400 StatusCode and "Home team name is required" error message', async() => {
                // Arrange
                const invalidData = { ...matchData(),homeTeam: ""};
                // Act
                const response = await request(app)
                                .post(`/api/matches/`)
                                .send(invalidData);
                // Assertion
                expect(response.status).toBe(ERROR_CODE.BAD_REQUEST);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: ERROR_TYPE.BAD_REQUEST,
                    code: ERROR_CODE.BAD_REQUEST,
                    detail: /Home team name is required/i
                })
            })

            it('When provide non-string to homeTeam,should response with 400 StatusCode and "homeTeam should be string" error message', async() => {
                // Arrange
                const invalidData = { ...matchData(),homeTeam: 5};
                // Act
                const response = await request(app)
                                .post(`/api/matches/`)
                                .send(invalidData);
                // Assertion
                expect(response.status).toBe(ERROR_CODE.BAD_REQUEST);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: ERROR_TYPE.BAD_REQUEST,
                    code: ERROR_CODE.BAD_REQUEST,
                    detail: /homeTeam should be string/i
                })
            })
            // awayTeam
            it('When provide empty string to awayTeam,should response with 400 StatusCode and "Away team name is required" error message', async() => {
                // Arrange
                const invalidData = { ...matchData(),awayTeam: ""};
                // Act
                const response = await request(app)
                                .post(`/api/matches/`)
                                .send(invalidData);
                // Assertion
                expect(response.status).toBe(ERROR_CODE.BAD_REQUEST);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: ERROR_TYPE.BAD_REQUEST,
                    code: ERROR_CODE.BAD_REQUEST,
                    detail: /Away team name is required/i
                })
            })

            it('When provide non-string to awayTeam,should response with 400 StatusCode and "awayTeam should be string" error message', async() => {
                // Arrange
                const invalidData = { ...matchData(),awayTeam: 5};
                // Act
                const response = await request(app)
                                .post(`/api/matches/`)
                                .send(invalidData);
                // Assertion
                expect(response.status).toBe(ERROR_CODE.BAD_REQUEST);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: ERROR_TYPE.BAD_REQUEST,
                    code: ERROR_CODE.BAD_REQUEST,
                    detail: /awayTeam should be string/i
                })
            })
            // homeScore
            it('When provide negative to homeScore,should response with 400 StatusCode and "Score cannot be negative" error message', async() => {
                // Arrange
                const invalidData = { ...matchData(),homeScore: -6};
                // Act
                const response = await request(app)
                                .post(`/api/matches/`)
                                .send(invalidData);
                // Assertion
                expect(response.status).toBe(ERROR_CODE.BAD_REQUEST);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: ERROR_TYPE.BAD_REQUEST,
                    code: ERROR_CODE.BAD_REQUEST,
                    detail: /Score cannot be negative/i
                })
            })
            it('When provide non-numeric to homeScore,should response with 400 StatusCode and "homeScore should be number" error message', async() => {
                // Arrange
                const invalidData = { ...matchData(),homeScore: "df"};
                // Act
                const response = await request(app)
                                .post(`/api/matches/`)
                                .send(invalidData);
                // Assertion
                expect(response.status).toBe(ERROR_CODE.BAD_REQUEST);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: ERROR_TYPE.BAD_REQUEST,
                    code: ERROR_CODE.BAD_REQUEST,
                    detail: /homeScore should be number/i
                })
            })
           // awayScore
            it('When provide negative to awayScore,should response with 400 StatusCode and "Score cannot be negative" error message', async() => {
                // Arrange
                const invalidData = { ...matchData(),awayScore: -6};
                // Act
                const response = await request(app)
                                .post(`/api/matches/`)
                                .send(invalidData);
                // Assertion
                expect(response.status).toBe(ERROR_CODE.BAD_REQUEST);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: ERROR_TYPE.BAD_REQUEST,
                    code: ERROR_CODE.BAD_REQUEST,
                    detail: /Score cannot be negative/i
                })
            })
            it('When provide non-numeric to awayScore,should response with 400 StatusCode and "awayScore should be number" error message', async() => {
                // Arrange
                const invalidData = { ...matchData(),awayScore: "df"};
                // Act
                const response = await request(app)
                                .post(`/api/matches/`)
                                .send(invalidData);
                // Assertion
                expect(response.status).toBe(ERROR_CODE.BAD_REQUEST);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: ERROR_TYPE.BAD_REQUEST,
                    code: ERROR_CODE.BAD_REQUEST,
                    detail: /awayScore should be number/i
                })
            })
            // StartTime
            it('When provide non-Date string to startTime,should response with 400 StatusCode and "Invalid ISO date format" error message', async() => {
                // Arrange
                const invalidData = { ...matchData(),startTime: "df"};
                // Act
                const response = await request(app)
                                .post(`/api/matches/`)
                                .send(invalidData);
                // Assertion
                expect(response.status).toBe(ERROR_CODE.BAD_REQUEST);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: ERROR_TYPE.BAD_REQUEST,
                    code: ERROR_CODE.BAD_REQUEST,
                    detail: /Invalid ISO date format/i
                })
            })
            // EndTime
            it('When provide non-Date string to endTime,should response with 400 StatusCode and "Invalid ISO date format" error message', async() => {
                // Arrange
                const invalidData = { ...matchData(),endTime: "df"};
                // Act
                const response = await request(app)
                                .post(`/api/matches/`)
                                .send(invalidData);
                // Assertion
                expect(response.status).toBe(ERROR_CODE.BAD_REQUEST);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: ERROR_TYPE.BAD_REQUEST,
                    code: ERROR_CODE.BAD_REQUEST,
                    detail: /Invalid ISO date format/i
                })
            })

            it('When provide endTime earlier than startTime,should response with 400 StatusCode and "The match cannot end before it starts (startTime must be before endTime)" error message', async() => {
                // Arrange
                const invalidData = { ...matchData(),endTime: new Date(Date.now()-5000000)};
                // Act
                const response = await request(app)
                                .post(`/api/matches/`)
                                .send(invalidData);
                // Assertion
                expect(response.status).toBe(ERROR_CODE.BAD_REQUEST);
                expect(response.body.data).toBeNull();
                expect(response.body.error).toMatchObject({
                    status: ERROR_TYPE.BAD_REQUEST,
                    code: ERROR_CODE.BAD_REQUEST,
                    detail: /The match cannot end before it starts (startTime must be before endTime)/i
                })
            })

        })

    })
})