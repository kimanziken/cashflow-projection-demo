import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Entry } from "../types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format, parse } from "date-fns";
import { database } from "../firebase/firebaseConfig";
import { push, ref, set } from "firebase/database";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function BulkChangeDates({
  entries,
  open,
  setOpen,
  setSelectedEntries,
  refetch,
}: {
  entries?: Entry[];
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedEntries: React.Dispatch<React.SetStateAction<Entry[]>>;
  refetch: () => void;
}) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  function bulkUpdateDates() {
    async function fn() {
      if (!selectedDate) {
        toast.error("Please select a date");
        return;
      }

      const promises = entries?.map((entry) => {
        if (entry.entry_type === "credit") {
          const creditRef = ref(database, `credits/${entry.id}`);
          return set(creditRef, {
            ...entry,
            date: format(selectedDate, "yyyy-MM-dd"),
          });
        } else if (entry.entry_type === "debit") {
          const debitRef = ref(database, `debits/${entry.id}`);
          return set(debitRef, {
            ...entry,
            date: format(selectedDate, "yyyy-MM-dd"),
          });
        } else {
          return Promise.resolve();
        }
      });

      return Promise.all(promises ?? []);
    }

    toast.promise(fn(), {
      loading: "Bulk updating dates",
      success() {
        setSelectedEntries([]);
        setOpen(false);
        refetch();
        return "Successfully updated dates. Updating page...";
      },
      error(e) {
        return "Error updating dates";
      },
    });
  }
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent>
        <DialogTitle>Change Entries Dates</DialogTitle>
        <div className="flex w-full max-w-full items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className={cn(
                  "w-full pl-3 text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
                variant="outline"
              >
                {selectedDate ? (
                  format(new Date(selectedDate), "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-full p-0">
              <Calendar
                initialFocus
                mode="single"
                onSelect={setSelectedDate}
                selected={selectedDate}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="float-right ml-auto mr-0 mt-4 flex gap-5">
          <Button
            type="button"
            onClick={() => {
              bulkUpdateDates();
            }}
          >
            Update Dates
          </Button>
          <Button
            type="button"
            onClick={() => setOpen(false)}
            variant="outline"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
