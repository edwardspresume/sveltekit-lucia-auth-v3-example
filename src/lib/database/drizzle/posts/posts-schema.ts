import { sqliteTable, int, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Define the users table
export const usersTable = sqliteTable('users', {
  id: int('id').primaryKey(),
  username: text('username').notNull(),
  admin: int('admin', { mode: 'boolean' }), //.default(0), // Using 0 for false and 1 for true
  tier: text('tier').default('Beginner')
});

// Define the posts table
export const postsTable = sqliteTable('posts', {
  id: int('id').primaryKey(),
  authorId: int('authorId'), //.notNull().references(() => usersTable.id),
  body: text('body'),
  title: text('title').notNull()
});

// Define relations
export const usersRelation = relations(usersTable, ({ many }) => ({
  posts: many(postsTable)
}));

export const postsRelation = relations(postsTable, ({ one }) => ({
  author: one(usersTable, {
    fields: [postsTable.authorId],
    references: [usersTable.id]
  })
}));

// Define the new table
export const newTable = sqliteTable('new', {
  id: int('id').primaryKey(),
  name: text('name')
});