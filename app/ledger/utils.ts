import { EnhancedCredit, EnhancedReconciliation, Entry } from "../types";

export function sortEntries(entries: Entry[]) {
  const _sortedEntries = entries.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();

    if (dateA !== dateB) {
      return dateA - dateB;
    }

    // Handle entries for the same date
    const aIsDebit = a.entry_type === "debit";
    const bIsDebit = b.entry_type === "debit";
    const aIsCredit = a.entry_type === "credit";
    const bIsCredit = b.entry_type === "credit";
    const aIsReconciliation = a.entry_type === "reconciliation";
    const bIsReconciliation = b.entry_type === "reconciliation";

    // Reconciliation comes first
    if (aIsReconciliation && !bIsReconciliation) {
      return -1;
    }
    if (!aIsReconciliation && bIsReconciliation) {
      return 1;
    }

    // Credits with type "CAPITAL" or "TILL_TRANSFER" come after reconciliations
    const priorityCreditTypes = ["CAPITAL", "TILL_TRANSFER"];
    const aIsPriorityCredit =
      aIsCredit && priorityCreditTypes.includes((a as EnhancedCredit).type);
    const bIsPriorityCredit =
      bIsCredit && priorityCreditTypes.includes((b as EnhancedCredit).type);

    if (aIsPriorityCredit && !bIsPriorityCredit) {
      return -1; // a is priority credit
    }
    if (!aIsPriorityCredit && bIsPriorityCredit) {
      return 1; // b is priority credit
    }

    // Debits come next
    if (aIsDebit && !bIsDebit) {
      return -1; // a is debit
    }
    if (!aIsDebit && bIsDebit) {
      return 1; // b is debit
    }

    // Other credits follow
    if (aIsCredit && !aIsPriorityCredit && bIsCredit && !bIsPriorityCredit) {
      return 0; // Both are other credits
    }

    return 0;
  });

  return _sortedEntries;
}

export function findClosestReconciliation(
  reconciliations: EnhancedReconciliation[]
): EnhancedReconciliation | undefined {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Remove time for comparison purposes

  const closestReconciliation = reconciliations.sort(
    (a, b) =>
      Math.abs(new Date(a.date).getTime() - today.getTime()) -
      Math.abs(new Date(b.date).getTime() - today.getTime())
  )[0];

  return closestReconciliation;
}

export function generateRandomId(length = 20) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return result;
}
