import { Database, get, ref, remove } from 'firebase/database';
import {
  CreditsRecord,
  DebitRecord,
  EnhancedCredit,
  EnhancedDebit,
  EnhancedReconciliation,
  ReconciliationRecord,
} from '../types';
import { toast } from 'sonner';
import { Dispatch, SetStateAction } from 'react';

export const fetchCredits = async (database: Database) => {
  try {
    const creditsRef = ref(database, 'credits');
    const snapshot = await get(creditsRef);
    if (snapshot.exists()) {
      const credits = snapshot.val();
      return credits as CreditsRecord;
    } else {
      return undefined;
    }
  } catch (error) {
    toast.error('Error fetching credits');
    return undefined;
  }
};
export const fetchDebits = async (database: Database) => {
  try {
    const debitsRef = ref(database, 'debits');
    const snapshot = await get(debitsRef);
    if (snapshot.exists()) {
      const debits = snapshot.val();
      return debits as DebitRecord;
    } else {
      return undefined;
    }
  } catch (error) {
    toast.error('Error fetching debits');
    return undefined;
  }
};
export const fetchReconciliations = async (database: Database) => {
  try {
    const reconciliationsRef = ref(database, 'reconciliations');
    const snapshot = await get(reconciliationsRef);
    if (snapshot.exists()) {
      const reconciliations = snapshot.val();
      return reconciliations as ReconciliationRecord;
    } else {
      return undefined;
    }
  } catch (error) {
    toast.error('Error fetching reconciliations');
    return undefined;
  }
};

export const deleteCredit = async (
  database: Database,
  id: string,
  credits: EnhancedCredit[],
  setCredits: Dispatch<SetStateAction<EnhancedCredit[]>>
) => {
  try {
    const creditRef = ref(database, `credits/${id}`);
    await remove(creditRef);
    setCredits(credits.filter((entry) => entry.id !== id));
    toast.success('Deleted credit');
  } catch (e) {
    toast.error('Error deleting credit');
  }
};
export const deleteDebit = async (
  database: Database,
  id: string,
  debits: EnhancedDebit[],
  setDebits: Dispatch<SetStateAction<EnhancedDebit[]>>
) => {
  try {
    const debitRef = ref(database, `debits/${id}`);
    await remove(debitRef);
    setDebits(debits.filter((entry) => entry.id !== id));
    toast.success('Deleted debit');
  } catch (e) {
    toast.error('Error deleting debit');
  }
};
export const deleteReconciliation = async (
  database: Database,
  id: string,
  reconciliations: EnhancedReconciliation[],
  setReconciliations: Dispatch<SetStateAction<EnhancedReconciliation[]>>
) => {
  try {
    const reconciliationRef = ref(database, `reconciliations/${id}`);
    await remove(reconciliationRef);
    setReconciliations(reconciliations.filter((entry) => entry.id !== id));
    toast.success('Deleted reconciliation');
  } catch (e) {
    toast.error('Error deleting reconciliation');
  }
};
