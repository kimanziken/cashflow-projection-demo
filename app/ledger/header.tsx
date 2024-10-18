'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ArrowDownFromLine,
  ArrowUpFromDot,
  CheckCircle,
  ChevronsUpDownIcon,
  Edit2Icon,
  LogOut,
  Sigma,
  TruckIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import AddCredit from './add-credit';
import AddDebit from './add-debit';
import { Dispatch, SetStateAction, useState } from 'react';
import {
  EnhancedCredit,
  EnhancedDebit,
  EnhancedReconciliation,
  Entry,
} from '../types';
import AddReconciliation from './add-reconciliation';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export interface EnabledActions {
  label: string;
  icon: LucideIcon;
  action: () => void;
  group: number;
  enabled: boolean;
}

export default function TransporterViewHeader({
  debits,
  setDebits,
  credits,
  setCredits,
  reconciliations,
  setReconciliations,
}: {
  debits: EnhancedDebit[];
  setDebits: Dispatch<SetStateAction<EnhancedDebit[]>>;
  credits: EnhancedCredit[];
  setCredits: Dispatch<SetStateAction<EnhancedCredit[]>>;
  reconciliations: EnhancedReconciliation[];
  setReconciliations: Dispatch<SetStateAction<EnhancedReconciliation[]>>;
}) {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState(false);
  const [addCredit, setAddCredit] = useState(false);
  const [addDebit, setAddDebit] = useState(false);
  const [reconcileAcc, setReconcileAcc] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  const enabledActions: EnabledActions[] = [
    {
      label: 'Add Credit',
      icon: ArrowDownFromLine,
      action: () => {
        setAddCredit(true);
      },
      group: 1,
      enabled: true,
    },
    {
      label: 'Add Debit',
      icon: ArrowUpFromDot,
      action: () => setAddDebit(true),
      group: 1,
      enabled: true,
    },
    {
      label: 'Add Reconciliation',
      icon: Sigma,
      action: () => {
        setReconcileAcc(true);
      },
      group: 1,
      enabled: true,
    },
    {
      label: 'Signout',
      icon: LogOut,
      action: () => {
        handleSignOut();
      },
      group: 1,
      enabled: true,
    },
  ];

  return (
    <>
      <AddCredit
        open={addCredit}
        setOpen={setAddCredit}
        credits={credits}
        setCredits={setCredits}
      />
      <AddDebit
        open={addDebit}
        setOpen={setAddDebit}
        debits={debits}
        setDebits={setDebits}
      />
      <AddReconciliation
        open={reconcileAcc}
        setOpen={setReconcileAcc}
        reconciliations={reconciliations}
        setReconciliations={setReconciliations}
      />

      <section className="mb-3 flex items-center justify-between border-b-2 px-6 py-6">
        <div className="flex flex-col gap-1.5">
          <span>View and manage cash flow projections</span>
        </div>

        <DropdownMenu onOpenChange={setOpenMenu} open={openMenu}>
          <DropdownMenuTrigger>
            <Button>
              Actions
              <ChevronsUpDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-lg p-0 py-2">
            {enabledActions
              .filter((a) => a.group === 1)
              .map((action) => (
                <DropdownMenuItem
                  className={cn(
                    'cursor-pointer rounded-none px-4 py-2 text-base'
                  )}
                  disabled={!action.enabled}
                  key={action.label}
                  onClick={() => {
                    action.action();
                    setOpenMenu(false);
                  }}
                >
                  <action.icon className="mr-3 h-5 w-5" />
                  <span>{action.label}</span>
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </section>
    </>
  );
}
