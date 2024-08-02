// TODO: better-sqlite3
// https://orm.drizzle.team/docs/get-started-sqlite#better-sqlite3
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
const sqlite = new Database('sqlite.db');
export const sqliteDb = drizzle(sqlite);
