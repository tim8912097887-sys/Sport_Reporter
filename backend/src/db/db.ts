// Make sure to install the 'pg' package 
import { env } from '@configs/env.js';
import { drizzle } from 'drizzle-orm/node-postgres';


export const db = drizzle({ 
  connection: { 
    connectionString: env.DATABASE_URL,
    // Fail fast to reconnect
    connectionTimeoutMillis: 5000,
    // Set lower statement timeout for data consistency
    statement_timeout: 10000,
    query_timeout: 12000,
    max: 15,
    // Prevent delay after idle
    min: 2,
    // Keep the client fresh
    idleTimeoutMillis: 5000,
  },
  casing: 'snake_case'
});
 
const result = await db.execute('select 1');
console.log(result);