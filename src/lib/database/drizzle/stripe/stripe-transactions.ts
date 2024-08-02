import {
  validateSubscriptionStatus,
  validateTransactionStatus,
} from "./validations";
import { sqliteDb as db } from "../db";
import { subscriptions, transactions } from "./turso-stripe-schema";

export async function createSubscription(
  userId: number,
  productId: number,
  status: string,
) {
  if (!validateSubscriptionStatus(status)) {
    throw new Error("Invalid subscription status");
  }

  await db.insert(subscriptions).values({ userId, productId, status });
}

export async function createTransaction(
  subscriptionId: number,
  amountCents: number,
  status: string,
) {
  if (!validateTransactionStatus(status)) {
    throw new Error("Invalid transaction status");
  }

  await db.insert(transactions).values({ subscriptionId, amountCents, status });
}
