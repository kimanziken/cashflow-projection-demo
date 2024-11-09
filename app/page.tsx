"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import AddCredit from "./ledger/add-credit";
import AddDebit from "./ledger/add-debit";
import TransporterViewHeader from "./ledger/header";
import { findClosestReconciliation, sortEntries } from "./ledger/utils";
import {
  EnhancedCredit,
  EnhancedDebit,
  EnhancedReconciliation,
  Entry,
  RunningBalanceEntry,
} from "./types";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { getFirestore } from "firebase/firestore";
import { app, database } from "./firebase/firebaseConfig";
import {
  deleteCredit,
  deleteDebit,
  deleteReconciliation,
  fetchCredits,
  fetchDebits,
  fetchReconciliations,
} from "./ledger/actions";

import { TableSkeleton } from "@/components/mine/skeleton";
import {
  ConfirmationDialog,
  useConfirmation,
} from "@/components/ui/use-confirmation";
import AddReconciliation from "./ledger/add-reconciliation";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Trash2 } from "lucide-react";
import BulkChangeDates from "./ledger/bulk-change-dates";

export default function Home() {
  const [loading, setLoading] = useState(true);

  const [credits, setCredits] = useState<EnhancedCredit[]>([]);
  const [debits, setDebits] = useState<EnhancedDebit[]>([]);
  const [reconciliations, setReconciliations] = useState<
    EnhancedReconciliation[]
  >([]);

  const [selectedCredit, setSelectedCredit] = useState<
    EnhancedCredit | undefined
  >();
  const [selectedDebit, setSelectedDebit] = useState<
    EnhancedDebit | undefined
  >();
  const [selectedReconciliation, setSelectedReconciliation] = useState<
    EnhancedReconciliation | undefined
  >();
  const [openAddCredit, setOpenAddCredit] = useState(false);
  const [openAddDebit, setOpenAddDebit] = useState(false);
  const [openReconciliation, setOpenReconciliation] = useState(false);
  const [openBulkChangeDates, setopenBulkChangeDates] = useState(false);

  const [sortedEntries, setSortedEntries] = useState<Entry[]>([]);
  const [runningBalanceEntries, setRunningBalanceEntries] = useState<
    RunningBalanceEntry[]
  >([]);

  const [selectedEntries, setSelectedEntries] = useState<Entry[]>([]);

  const { confirm, dialogProps } = useConfirmation();

  function runFetchEntries() {
    setLoading(true);
    fetchEntries()
      .then(() => {
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }
  async function fetchEntries() {
    fetchCredits(database).then((fetchedCredits) => {
      if (fetchedCredits) {
        const parsedCredits: EnhancedCredit[] = Object.entries(
          fetchedCredits
        ).map(([key, record]) => {
          return { ...record, id: key, entry_type: "credit" };
        });
        setCredits(parsedCredits);
      } else {
        setCredits([]);
      }
    }),
      fetchDebits(database).then((fetchedDebits) => {
        if (fetchedDebits) {
          const parsedDebits: EnhancedDebit[] = Object.entries(
            fetchedDebits
          ).map(([key, record]) => {
            return { ...record, id: key, entry_type: "debit" };
          });
          setDebits(parsedDebits);
        } else {
          setDebits([]);
        }
      }),
      fetchReconciliations(database).then((fetchedReconciliations) => {
        if (fetchedReconciliations) {
          const parsedReconciliations: EnhancedReconciliation[] =
            Object.entries(fetchedReconciliations).map(([key, record]) => {
              return { ...record, id: key, entry_type: "reconciliation" };
            });
          setReconciliations(parsedReconciliations);
        } else {
          setReconciliations([]);
        }
      });
  }
  useEffect(() => {
    runFetchEntries();
  }, []);

  useEffect(() => {
    if (credits && debits && reconciliations) {
      const rawSortedEntries = sortEntries([
        ...reconciliations,
        ...credits,
        ...debits,
      ]);
      setSortedEntries(rawSortedEntries);
    }
  }, [credits, debits, reconciliations]);

  useEffect(() => {
    if (!reconciliations) {
      setRunningBalanceEntries([]);
      return;
    }

    const closestReconciliation = findClosestReconciliation(reconciliations);
    let reconciliationSlicedEntries: Entry[] = [];

    if (closestReconciliation) {
      const closestDate = closestReconciliation.date;
      const index = sortedEntries.findIndex(
        (entry) =>
          entry.date === closestDate && entry.entry_type === "reconciliation"
      );
      if (index !== -1) {
        reconciliationSlicedEntries = sortedEntries.slice(index);
      }
    }

    let _runningBalanceEntries: RunningBalanceEntry[] = [];
    if (reconciliationSlicedEntries.length > 0 && closestReconciliation) {
      _runningBalanceEntries.push({
        ...closestReconciliation,
        runningBalance: closestReconciliation.currentAmount,
      });
      let runningBalance = closestReconciliation.currentAmount;
      for (const entry of reconciliationSlicedEntries.slice(1)) {
        if (entry.entry_type === "debit") {
          runningBalance -= entry.amount;
          _runningBalanceEntries.push({ ...entry, runningBalance });
        } else if (entry.entry_type === "credit") {
          runningBalance += entry.amount;
          _runningBalanceEntries.push({ ...entry, runningBalance });
        }
      }
      setRunningBalanceEntries(_runningBalanceEntries);
    } else {
      setRunningBalanceEntries([]);
    }
  }, [sortedEntries]);

  return (
    <>
      <AddCredit
        open={openAddCredit}
        setOpen={setOpenAddCredit}
        credit={selectedCredit}
        credits={credits}
        setCredits={setCredits}
      />
      <AddDebit
        open={openAddDebit}
        setOpen={setOpenAddDebit}
        debit={selectedDebit}
        debits={debits}
        setDebits={setDebits}
      />
      <AddReconciliation
        open={openReconciliation}
        setOpen={setOpenReconciliation}
        reconciliation={selectedReconciliation}
        reconciliations={reconciliations}
        setReconciliations={setReconciliations}
      />
      <TransporterViewHeader
        debits={debits}
        setDebits={setDebits}
        credits={credits}
        setCredits={setCredits}
        reconciliations={reconciliations}
        setReconciliations={setReconciliations}
      />
      <BulkChangeDates
        entries={selectedEntries}
        open={openBulkChangeDates}
        setOpen={setopenBulkChangeDates}
        setSelectedEntries={setSelectedEntries}
        refetch={runFetchEntries}
      />
      <ConfirmationDialog {...dialogProps} />
      <div className="mx-auto max-w-7xl px-5 pb-12 md:px-0">
        {!loading ? (
          <>
            {selectedEntries.length > 0 ? (
              <div className="flex justify-end gap-4 mt-6">
                <Button
                  onClick={() => {
                    setopenBulkChangeDates(true);
                  }}
                  variant="outline"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Change Dates
                </Button>
              </div>
            ) : null}
            <Card className="mt-6">
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-5">Select</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Day</TableHead>
                      <TableHead>Credit</TableHead>
                      <TableHead>Debit</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <>
                      {runningBalanceEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="w-5">
                            <Checkbox
                              checked={selectedEntries.some(
                                (_entry) => entry.id === _entry.id
                              )}
                              onCheckedChange={(checkedState) => {
                                const isChecked = checkedState.valueOf();
                                if (isChecked) {
                                  if (
                                    !selectedEntries.some(
                                      (_entry) => entry.id === _entry.id
                                    )
                                  ) {
                                    setSelectedEntries((prev) => [
                                      ...prev,
                                      entry,
                                    ]);
                                  }
                                } else {
                                  if (
                                    selectedEntries.some(
                                      (_entry) => entry.id === _entry.id
                                    )
                                  ) {
                                    setSelectedEntries((prev) =>
                                      prev.filter(
                                        (_entry) => _entry.id !== entry.id
                                      )
                                    );
                                  }
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {format(new Date(entry.date), "yyyy-MM-dd")}
                          </TableCell>
                          <TableCell>
                            {format(new Date(entry.date), "EEEE")}
                          </TableCell>
                          <TableCell
                            className={cn(
                              entry.entry_type === "credit" &&
                                entry.type === "EXPECTED_EOD" &&
                                "bg-yellow-200",
                              entry.entry_type === "credit" &&
                                "hover: cursor-pointer"
                            )}
                            onClick={() => {
                              if (entry.entry_type === "credit") {
                                setSelectedCredit(entry);
                                setOpenAddCredit(true);
                              }
                            }}
                          >
                            {entry.entry_type === "credit"
                              ? `${entry.amount} - ${entry.type}`
                              : "-"}
                          </TableCell>
                          <TableCell
                            className={cn(
                              entry.entry_type === "debit" &&
                                "hover: cursor-pointer"
                            )}
                            onClick={() => {
                              if (entry.entry_type === "debit") {
                                setSelectedDebit(entry);
                                setOpenAddDebit(true);
                              }
                            }}
                          >
                            {entry.entry_type === "debit"
                              ? `${entry.amount} - ${entry.narration}`
                              : "-"}
                          </TableCell>
                          <TableCell
                            className={cn(
                              entry.entry_type === "reconciliation" &&
                                "hover:cursor-pointer",
                              {
                                "bg-blue-400":
                                  entry.entry_type === "reconciliation",
                                "bg-red-200":
                                  entry.entry_type !== "reconciliation" &&
                                  entry.runningBalance < 5000,
                                "bg-red-600":
                                  entry.entry_type !== "reconciliation" &&
                                  entry.runningBalance < 0,
                              }
                            )}
                            onClick={() => {
                              if (entry.entry_type === "reconciliation") {
                                setSelectedReconciliation(entry);
                                setOpenReconciliation(true);
                              }
                            }}
                          >
                            {`${entry.runningBalance}${entry.entry_type === "reconciliation" ? " - Reconciliation" : ""}`}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                                  variant="ghost"
                                >
                                  <DotsHorizontalIcon className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-[160px]"
                              >
                                <DropdownMenuItem
                                  className="text-base"
                                  onClick={() => {
                                    confirm({
                                      title: "Delete Entry?",
                                      description:
                                        "Are you sure you want to delete this entry ?",
                                      onConfirm: () => {
                                        if (entry.entry_type === "credit") {
                                          deleteCredit(
                                            database,
                                            entry.id,
                                            credits,
                                            setCredits
                                          );
                                        } else if (
                                          entry.entry_type === "debit"
                                        ) {
                                          deleteDebit(
                                            database,
                                            entry.id,
                                            debits,
                                            setDebits
                                          );
                                        } else if (
                                          entry.entry_type === "reconciliation"
                                        ) {
                                          deleteReconciliation(
                                            database,
                                            entry.id,
                                            reconciliations,
                                            setReconciliations
                                          );
                                        }
                                      },
                                    });
                                  }}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        ) : (
          <TableSkeleton columns={4} rows={10} />
        )}
      </div>
    </>
  );
}
