import { jest } from '@jest/globals';
import request from "supertest";
import { ERROR_CODE, ERROR_TYPE } from "@/shared/error/api.js";

// Mock the module using the unstable ESM method
// Note: This MUST stay at the top level
await jest.unstable_mockModule("@utils/arcjet.js", () => ({
    httpArcjet: {
        protect: jest.fn()
    },
    socketArcjet: {
        protect: jest.fn()
    }
}));

// Dynamically import the modules AFTER the mock is defined
// This is critical; static imports at the top will bypass the mock
const { httpArcjet } = await import("@utils/arcjet.js");
const { app } = await import("@/app.js");

const mockedArcjet = jest.mocked(httpArcjet.protect);

describe("Security Test", () => {
    describe("Success", () => {
        it('When normal traffic comes, should pass the request', async () => {
            // Arrange - Now mockedArcjet IS a jest.fn()
            mockedArcjet.mockResolvedValue({
                isDenied: () => false,
                reason: { 
                    isRateLimit: () => false,
                    isBot: () => false 
                },
            } as any);

            // Act
            const response = await request(app)
                                   .get(`/api/matches/?limit=1`)
                                   .set('User-Agent', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'); // Set header to allow bot
            // Assertion
            expect(response.status).not.toBe(ERROR_CODE.FORBIDDEN);
            expect(response.status).not.toBe(ERROR_CODE.TOO_MANY_REQUEST);
            expect(response.body.error).toBeNull(); 
        });
    });

    describe("Fail",() => {
        
        it('When exceed the slidewindow allowance,should response with 429 StatusCode and "Exceed Rate Limit" error message', async() => {
            // Arrange 
            mockedArcjet.mockResolvedValue({
                isDenied: () => true,
                reason: { 
                    isRateLimit: () => true,
                    isBot: () => false 
                },
            } as any);

            // Act
            const response = await request(app).get(`/api/matches/?limit=1`);

            // Assertion
            expect(response.status).toBe(ERROR_CODE.TOO_MANY_REQUEST);
            expect(response.body.data).toBeNull();
            expect(response.body.error).toMatchObject({
                status: ERROR_TYPE.TOO_MANY_REQUEST,
                code: ERROR_CODE.TOO_MANY_REQUEST,
                detail: /Exceed Rate Limit/i
            }) 
        })

        it('When request as bot,should response with 403 StatusCode and "Bot detected" error message', async() => {
            // Arrange 
            mockedArcjet.mockResolvedValue({
                isDenied: () => true,
                reason: { 
                    isRateLimit: () => false,
                    isBot: () => true 
                },
            } as any);

            // Act
            const response = await request(app).get(`/api/matches/?limit=1`);

            // Assertion
            expect(response.status).toBe(ERROR_CODE.FORBIDDEN);
            expect(response.body.data).toBeNull();
            expect(response.body.error).toMatchObject({
                status: ERROR_TYPE.FORBIDDEN,
                code: ERROR_CODE.FORBIDDEN,
                detail: /Bot detected/i
            }) 
        })
    })
});