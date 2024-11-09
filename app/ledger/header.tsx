"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { signOut } from "firebase/auth";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDownFromLine,
  ArrowUpFromDot,
  ChevronsUpDownIcon,
  LogOut,
  Sigma,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";
import { auth } from "../firebase/firebaseConfig";
import {
  EnhancedCredit,
  EnhancedDebit,
  EnhancedReconciliation,
} from "../types";
import AddCredit from "./add-credit";
import AddDebit from "./add-debit";
import AddReconciliation from "./add-reconciliation";

export interface EnabledActions {
  label: string;
  icon: LucideIcon;
  action: () => void;
  group: number;
  enabled: boolean;
}

export default function LedgerViewHeader({
  debits,
  setDebits,
  credits,
  setCredits,
  reconciliations,
  setReconciliations,
  refetch,
}: {
  debits: EnhancedDebit[];
  setDebits: Dispatch<SetStateAction<EnhancedDebit[]>>;
  credits: EnhancedCredit[];
  setCredits: Dispatch<SetStateAction<EnhancedCredit[]>>;
  reconciliations: EnhancedReconciliation[];
  setReconciliations: Dispatch<SetStateAction<EnhancedReconciliation[]>>;
  refetch: () => void;
}) {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState(false);
  const [addCredit, setAddCredit] = useState(false);
  const [addDebit, setAddDebit] = useState(false);
  const [reconcileAcc, setReconcileAcc] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  const enabledActions: EnabledActions[] = [
    {
      label: "Money In",
      icon: ArrowDownFromLine,
      action: () => {
        setAddCredit(true);
      },
      group: 1,
      enabled: true,
    },
    {
      label: "Money Out",
      icon: ArrowUpFromDot,
      action: () => setAddDebit(true),
      group: 1,
      enabled: true,
    },
    {
      label: "Add Reconciliation",
      icon: Sigma,
      action: () => {
        setReconcileAcc(true);
      },
      group: 1,
      enabled: true,
    },
    {
      label: "Signout",
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
        entries={[...credits, ...debits, ...reconciliations]}
        refetch={refetch}
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
                    "cursor-pointer rounded-none px-4 py-2 text-base"
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
