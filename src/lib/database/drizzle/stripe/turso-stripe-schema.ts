import { sqliteTable, text, integer, int } from 'drizzle-orm/sqlite-core';

// Define enums
export const subscriptionStatusValues = ['ACTIVE', 'INACTIVE', 'PAST_DUE', 'CANCELED'];
export const transactionStatusValues = ['PENDING', 'SUCCEEDED', 'FAILED'];

const id = () => int('id').primaryKey()

// Define tables
export const users = sqliteTable('users', {
  id: id(),
  email: text('email').unique().notNull(),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP').notNull()
});

export const products = sqliteTable('products', {
  id: id(),
  name: text('name').notNull(),
  priceCents: integer('price_cents').notNull(),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP').notNull()
});

export const subscriptions = sqliteTable('subscriptions', {
  id: id(),
  userId: int('user_id').references(() => users.id).notNull(),
  productId: int('product_id').references(() => products.id).notNull(),
  status: text('status').notNull(), // Represents SubscriptionStatus
  startDate: text('start_date').default('CURRENT_TIMESTAMP').notNull(),
  endDate: text('end_date'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP').notNull()
});

export const transactions = sqliteTable('transactions', {
  id: id(),
  subscriptionId: int('subscription_id').references(() => subscriptions.id).notNull(),
  amountCents: integer('amount_cents').notNull(),
  currency: text('currency').default('USD').notNull(),
  status: text('status').notNull(), // Represents TransactionStatus
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP').notNull()
});