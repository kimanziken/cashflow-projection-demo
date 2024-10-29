import { EnhancedReconciliation, Entry } from "../types";

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
      return -1; // a is reconciliation, goes first
    }
    if (!aIsReconciliation && bIsReconciliation) {
      return 1; // b is reconciliation, goes first
    }

    // Debits come 2nd
    if (aIsDebit && !bIsDebit) {
      return -1; // a is debit, b is not
    }
    if (!aIsDebit && bIsDebit) {
      return 1; // b is debit, a is not
    }

    // If both are debits or both are not debits, check for credits
    if (aIsCredit && !bIsCredit) {
      return 1; // a is credit, b is not
    }
    if (!aIsCredit && bIsCredit) {
      return -1; // b is credit, a is not
    }

    // Handle credits: EXPECTED_EOD and ACTUAL_EOD should be last among credits
    if (aIsCredit && bIsCredit) {
      if (a.type === "EXPECTED_EOD" || a.type === "ACTUAL_EOD") {
        return 1; // a is EXPECTED_EOD or ACTUAL_EOD, goes last
      }
      if (b.type === "EXPECTED_EOD" || b.type === "ACTUAL_EOD") {
        return -1; // b is EXPECTED_EOD or ACTUAL_EOD, goes last
      }
      return 0; // Both are credits of different types
    }

    return 0; // If all are the same type
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
