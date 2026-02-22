import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { env } from '@configs/env.js';
import { logger } from '@utils/logger.js';

const { Pool } = pg;

// Create the pool separately so we can export it
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  statement_timeout: 10000,
  query_timeout: 12000,
  max: 15,
  min: 2,
  idleTimeoutMillis: 5000,
});

export const db = drizzle(pool, { casing: 'snake_case' });

// Handle event
pool.on("connect",(client) => {
    logger.info(`Database Connection: Success`);
    // Create database if not created
    client.query("")
})
pool.on("error",(error) => {
    logger.error(`Database Error: ${error}`);
})
pool.on("acquire",() => {
    logger.info(`Database Pool: Client acquire`);
})
pool.on("release",() => {
    logger.info(`Database Pool: Client Release`);
})
pool.on("remove",() => {
    logger.info(`Database Pool: Client Remove`);
})

//Handle Disconnection
export const dbDisconnection = async() => {
      await pool.end();
}

