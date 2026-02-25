/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
    // Use the specific ESM preset
    preset: "ts-jest/presets/default-esm",
    testEnvironment: "node",
    rootDir: "./",
    
    testMatch: ["<rootDir>/test/**/*.test.ts", "<rootDir>/test/**/*.spec.ts"],
    extensionsToTreatAsEsm: ['.ts'],
    moduleFileExtensions: ["ts", "js"],
    
    // Ensure this path is exactly where the file is
    setupFilesAfterEnv: ["<rootDir>/test/jest.setup.ts"],
    
    verbose: true,
    clearMocks: true,

    moduleNameMapper: {
        // Specific aliases first
        '^@utils/(.*)\\.js$': '<rootDir>/src/utils/$1',
        '^@configs/(.*)\\.js$': '<rootDir>/src/configs/$1',
        '^@db/(.*)\\.js$': '<rootDir>/src/db/$1',
        '^@routes/(.*)\\.js$': '<rootDir>/src/routes/$1',
        '^@middleware/(.*)\\.js$': '<rootDir>/src/middleware/$1',
        '^@validations/(.*)\\.js$': '<rootDir>/src/validations/$1',
        '^@controllers/(.*)\\.js$': '<rootDir>/src/controllers/$1',
        '^@shared/(.*)\\.js$': '<rootDir>/src/shared/$1',
        '^@/(.*)\\.js$': '<rootDir>/src/$1',
        
        // The ESM "strip extension" trick must be last
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },

    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                useESM: true,
                tsconfig: 'tsconfig.test.json',
            },
        ],
    },
    // collectCoverage: true,
    // coverageProvider: "v8",
    // coverageReporters: ["html", "text", "json"],
}