import { pgTable, serial, text, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
 
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name'),
});
 
export const usersRelations = relations(users, ({ many }) => ({
  author: many(posts, { relationName: 'author' }),
  reviewer: many(posts, { relationName: 'reviewer' }),
}));
 
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  content: text('content'),
  authorId: integer('author_id'),
  reviewerId: integer('reviewer_id'),
});
 
export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
    relationName: 'author',
  }),
  reviewer: one(users, {
    fields: [posts.reviewerId],
    references: [users.id],
    relationName: 'reviewer',
  }),
}));