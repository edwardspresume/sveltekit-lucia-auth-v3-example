import { int, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
// import { relations } from 'drizzle-orm';

// Define enums
export const subscriptionStatusValues = [
  "ACTIVE",
  "INACTIVE",
  "PAST_DUE",
  "CANCELED",
];
export const transactionStatusValues = ["PENDING", "SUCCEEDED", "FAILED"];

// Takes an enum and return an array with each values
export function enumToSqLiteEnum(myEnum: any): [string, ...string[]] {
  return Object.values(myEnum).map((value: any) => `${value}`) as [
    string,
    ...string[],
  ];
}

export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PAST_DUE = "PAST_DUE",
  CANCELED = "CANCELED",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  SUCCEEDED = "SUCCEEDED",
  FAILED = "FAILED",
}

const id = () => int("id").primaryKey();

// Define tables
export const users = sqliteTable("users", {
  id: id(),
  email: text("email").unique().notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP").notNull(),
});

export const products = sqliteTable("products", {
  id: id(),
  name: text("name").notNull(),
  priceCents: integer("price_cents").notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP").notNull(),
});

export const subscriptions = sqliteTable("subscriptions", {
  id: id(),
  userId: int("user_id").references(() => users.id).notNull(),
  productId: int("product_id").references(() => products.id).notNull(),
  // status: text('status').notNull(), // Represents SubscriptionStatus
  status: text("status", {
    enum: enumToSqLiteEnum(SubscriptionStatus), // ["ACTIVE", "INACTIVE", "PAST_DUE", "CANCELED"],
  }), //.default('NONE'),
  startDate: text("start_date").default("CURRENT_TIMESTAMP").notNull(),
  endDate: text("end_date"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP").notNull(),
});

export const transactions = sqliteTable("transactions", {
  id: id(),
  subscriptionId: int("subscription_id").references(() => subscriptions.id)
    .notNull(),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").default("USD").notNull(),
  // status: text('status').notNull(), // Represents TransactionStatus
  status: text("status", { enum: enumToSqLiteEnum(TransactionStatus) }), // ["PENDING", "SUCCEEDED", "FAILED"] }), //.default('NONE'),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP").notNull(),
});
