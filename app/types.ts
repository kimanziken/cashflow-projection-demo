export type Credit = {
  amount: number;
  date: string;
  type: string;
};
export type EnhancedCredit = Credit & {
  id: string;
  entry_type: "credit";
};
export type CreditsRecord = {
  [key: string]: Credit;
};
export type Debit = {
  narration: string;
  amount: number;
  date: string;
  remarks?: string | null;
};
export type EnhancedDebit = Debit & {
  id: string;
  entry_type: "debit";
};
export type DebitRecord = {
  [key: string]: Debit;
};
export type Reconciliation = {
  currentAmount: number;
  date: string;
  narration: string;
};
export type EnhancedReconciliation = Reconciliation & {
  id: string;
  entry_type: "reconciliation";
};
export type ReconciliationRecord = {
  [key: string]: Reconciliation;
};
export type Entry = EnhancedCredit | EnhancedDebit | EnhancedReconciliation;
export type RunningBalanceEntry = Entry & {
  runningBalance: number;
};
export type RecordType = Record<string, Entry[]>;
