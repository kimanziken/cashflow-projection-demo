"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { EnhancedCredit, Entry } from "../types";

import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { Dispatch, SetStateAction, useEffect } from "react";
import { z } from "zod";
import { generateRandomId } from "./utils";

import { push, ref, set } from "firebase/database";
import { toast } from "sonner";
import { database } from "../firebase/firebaseConfig";

const CreditSchema = z.object({
  date: z.date().refine((date) => !isNaN(date.getTime()), {
    message: "Please select a valid date",
  }),
  type: z.string().nonempty("Please select a type"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
});

export default function AddCredit({
  credit,
  open,
  setOpen,
  credits,
  setCredits,
}: {
  credit?: EnhancedCredit;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  credits: EnhancedCredit[];
  setCredits: Dispatch<SetStateAction<EnhancedCredit[]>>;
}) {
  const form = useForm<z.infer<typeof CreditSchema>>({
    resolver: zodResolver(CreditSchema),
    defaultValues: {
      date: credit?.date ? new Date(credit.date) : undefined,
      type: credit?.type || "",
      amount: credit?.amount || undefined,
    },
  });

  useEffect(() => {
    if (credit) {
      form.setValue("date", new Date(credit.date));
      form.setValue("type", credit.type);
      form.setValue("amount", credit.amount);
    } else {
      form.reset();
    }
  }, [credit]);

  function onSubmit(formValues: z.infer<typeof CreditSchema>) {
    const addCredit = async () => {
      try {
        const creditsRef = ref(database, "credits");
        const newDataRef = push(creditsRef);
        await set(newDataRef, {
          date: format(formValues.date, "yyyy-MM-dd"),
          amount: formValues.amount,
          type: formValues.type,
        });
        toast.success("Saved credit");
        const newId = newDataRef.key || generateRandomId();
        const newEntry: Entry = {
          id: generateRandomId(),
          date: format(formValues.date, "yyyy-MM-dd"),
          entry_type: "credit",
          type: formValues.type,
          amount: formValues.amount,
        };
        const updatedCredits = [...credits, newEntry];
        setCredits(updatedCredits);
      } catch (e) {
        toast.error("Error saving credit");
      } finally {
        setOpen(false);
      }
    };

    const updateCredit = async (id: string) => {
      try {
        const creditRef = ref(database, `credits/${id}`);
        await set(creditRef, {
          date: format(formValues.date, "yyyy-MM-dd"),
          type: formValues.type,
          amount: formValues.amount,
        });
        const updatedEntry: Entry = {
          id,
          date: format(formValues.date, "yyyy-MM-dd"),
          entry_type: "credit",
          type: formValues.type,
          amount: formValues.amount,
        };

        setCredits(
          credits.map((entry) => (entry.id === id ? updatedEntry : entry))
        );

        toast.success("Updated credit");
      } catch (e) {
        toast.error("Error updating credit");
      } finally {
        setOpen(false);
      }
    };

    if (!credit) {
      addCredit();
    } else {
      updateCredit(credit.id);
    }
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent>
        <DialogTitle>{credit ? "Edit Credit" : "Add Credit"}</DialogTitle>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="mb-2">
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <div className="flex w-full max-w-full items-center space-x-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                variant="outline"
                              >
                                {field.value ? (
                                  format(new Date(field.value), "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent align="start" className="w-full p-0">
                            <Calendar
                              initialFocus
                              mode="single"
                              onSelect={field.onChange}
                              selected={
                                field.value ? new Date(field.value) : undefined
                              }
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="mb-2">
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select the type of Credit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="EXPECTED_EOD">
                            EXPECTED_EOD
                          </SelectItem>
                          <SelectItem value="ACTUAL_EOD">ACTUAL_EOD</SelectItem>
                          <SelectItem value="CAPITAL">CAPITAL</SelectItem>
                          <SelectItem value="PDQ_SALES">PDQ_SALES</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name="amount"
                render={({ field }) => (
                  <FormItem className="mb-2">
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter amount"
                        value={field.value || ""}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="float-right ml-auto mr-0 mt-4 flex gap-5">
              <Button type="submit">{credit ? "Update" : "Save"}</Button>
              <Button onClick={() => setOpen(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
