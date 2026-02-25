import { db, dbDisconnection } from '@/db/db.js';
import { commentary, matches } from '@/db/schema.js';
import { config } from 'dotenv';
// Load test environment variables
config({ path: '.env.test' });

// Global teardown prevent race condition
afterEach(async() => {
    await db.delete(commentary);
    await db.delete(matches);
},10000)
afterAll(async() => {
           await dbDisconnection();
},10000)
export {}