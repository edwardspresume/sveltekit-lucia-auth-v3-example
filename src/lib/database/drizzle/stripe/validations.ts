import { subscriptionStatusValues, transactionStatusValues } from "./turso-stripe-schema";

const validSubscriptionStatuses = subscriptionStatusValues
const validTransactionStatuses = transactionStatusValues

export function validateSubscriptionStatus(status: string): boolean {
  return validSubscriptionStatuses.includes(status);
}

export function validateTransactionStatus(status: string): boolean {
  return validTransactionStatuses.includes(status);
}