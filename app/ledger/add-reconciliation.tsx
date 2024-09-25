'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  Credit,
  EnhancedReconciliation,
  Entry,
  Reconciliation,
} from '../types';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from '@radix-ui/react-icons';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { generateRandomId, sortEntries } from './utils';

import { push, ref, remove, set } from 'firebase/database';
import { database } from '../firebase/firebaseConfig';
import { toast } from 'sonner';

const CreditSchema = z.object({
  date: z.date().refine((date) => !isNaN(date.getTime()), {
    message: 'Please select a valid date',
  }),
  narration: z.string().nonempty('Please enter narration'),
  balance: z.coerce.number().positive('Balance must be greater than zero'),
});

export default function AddReconciliation({
  reconciliation,
  open,
  setOpen,
  reconciliations,
  setReconciliations,
}: {
  reconciliation?: EnhancedReconciliation;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  reconciliations: EnhancedReconciliation[];
  setReconciliations: Dispatch<SetStateAction<EnhancedReconciliation[]>>;
}) {
  const form = useForm<z.infer<typeof CreditSchema>>({
    resolver: zodResolver(CreditSchema),
  });

  useEffect(() => {
    if (reconciliation) {
      form.setValue('date', new Date(reconciliation.date));
      form.setValue('balance', reconciliation.currentAmount);
      form.setValue('narration', reconciliation.narration);
    } else {
      form.reset();
    }
  }, [reconciliation]);

  function onSubmit(formValues: z.infer<typeof CreditSchema>) {
    const addReconciliation = async () => {
      try {
        const reconciliationRef = ref(database, 'reconciliations');
        const newDataRef = push(reconciliationRef);
        await set(newDataRef, {
          date: format(formValues.date, 'yyyy-MM-dd'),
          narration: formValues.narration,
          currentAmount: formValues.balance,
        });
        const newId = newDataRef.key || generateRandomId();
        const newEntry: Entry = {
          id: newId,
          date: format(formValues.date, 'yyyy-MM-dd'),
          entry_type: 'reconciliation',
          narration: formValues.narration,
          currentAmount: formValues.balance,
        };

        setReconciliations([...reconciliations, newEntry]);
        toast.success('Saved reconciliation');
      } catch (e) {
        toast.error('Error saving reconciliation');
      } finally {
        setOpen(false);
      }
    };

    const updateReconciliation = async (id: string) => {
      try {
        const reconciliationRef = ref(database, `reconciliations/${id}`);
        await set(reconciliationRef, {
          date: format(formValues.date, 'yyyy-MM-dd'),
          narration: formValues.narration,
          currentAmount: formValues.balance,
        });
        const updatedEntry: Entry = {
          id,
          date: format(formValues.date, 'yyyy-MM-dd'),
          entry_type: 'reconciliation',
          narration: formValues.narration,
          currentAmount: formValues.balance,
        };

        setReconciliations(
          reconciliations.map((entry) =>
            entry.id === id ? updatedEntry : entry
          )
        );

        toast.success('Updated reconciliation');
      } catch (e) {
        toast.error('Error updating reconciliation');
      } finally {
        setOpen(false);
      }
    };

    if (!reconciliation) {
      addReconciliation();
    } else {
      updateReconciliation(reconciliation.id);
    }
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent>
        <DialogTitle>
          {reconciliation ? 'Edit Reconciliation' : 'Add Reconciliation'}
        </DialogTitle>
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
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                                variant="outline"
                              >
                                {field.value ? (
                                  format(new Date(field.value), 'PPP')
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
                name="narration"
                render={({ field }) => (
                  <FormItem className="mb-2">
                    <FormLabel>Narration</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter narration"
                        value={field.value || ''}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name="balance"
                render={({ field }) => (
                  <FormItem className="mb-2">
                    <FormLabel>Current balance</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter current balance"
                        value={field.value || ''}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="float-right ml-auto mr-0 mt-4 flex gap-5">
              <Button type="submit">
                {reconciliation ? 'Update' : 'Save'}
              </Button>
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
