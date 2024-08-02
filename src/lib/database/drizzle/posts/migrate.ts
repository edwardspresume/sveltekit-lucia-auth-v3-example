import 'dotenv/config';
import { db, client } from './db';
import { migrate } from 'drizzle-orm/libsql/migrator';

await migrate(db, { migrationsFolder: './migrations' });

await client.close();
