import { ExpectedDailyEOD } from "@/lib/daily_eod_projections";
import {
  EnhancedCredit,
  EnhancedDebit,
  EnhancedReconciliation,
  Entry,
} from "../types";
import { push, ref, set } from "firebase/database";
import { database } from "../firebase/firebaseConfig";
import { format } from "date-fns";
import { toast } from "sonner";

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

    // Credits with type "CAPITAL", "TILL_TRANSFER", or "PICK_UP" come after reconciliations
    const priorityCreditTypes = ["CAPITAL", "TILL_TRANSFER", "PICPK_UP", "OVERDRAFT"];
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

function getDateRange(startDate: Date, endDate: Date): string[] {
  const range: string[] = [];
  while (startDate <= endDate) {
    range.push(startDate.toISOString().split("T")[0]);
    startDate.setDate(startDate.getDate() + 1);
  }
  return range;
}

function getDayOfWeek(
  date: string
):
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday" {
  const dateObj = new Date(date);
  const options = { weekday: "long" } as const;
  return dateObj.toLocaleDateString("en-US", options) as
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";
}

export async function processDebitsAndCheckForCredits(
  entries: Entry[],
  refetch: () => void
) {
  console.log("Entering");
  const today = new Date();

  const futureDate = entries
    .filter((entry) => entry.entry_type === "debit")
    .map((entry) => new Date(entry.date))
    .reduce(
      (latest, current) => (current > latest ? current : latest),
      new Date(today)
    );

  console.log("futureDate: ", futureDate);

  const dateRange = getDateRange(today, futureDate);
  console.log("dateRange: ", dateRange);

  const promises = dateRange.map(async (date) => {
    const dayOfWeek = getDayOfWeek(date);

    const hasExpectedEOD = entries.some(
      (entry: Entry) =>
        entry.entry_type === "credit" &&
        entry.type === "EXPECTED_EOD" &&
        entry.date === date
    );

    if (hasExpectedEOD) {
      return;
    }

    const expectedAmount = ExpectedDailyEOD[dayOfWeek];
    if (expectedAmount !== undefined) {
      const creditsRef = ref(database, "credits");
      const newDataRef = push(creditsRef);
      console.log("Attempting: ", {
        date: date,
        amount: expectedAmount,
        type: "EXPECTED_EOD",
      });
      await set(newDataRef, {
        date: date,
        amount: expectedAmount,
        type: "EXPECTED_EOD",
      });
    }
  });

  await Promise.all(promises)
    .then(() => {
      refetch();
    })
    .catch((e) => {
      toast.error("Error auto generating post-dated expected EODs");
    });
}
