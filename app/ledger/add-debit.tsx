'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Debit, EnhancedDebit, Entry } from '../types';
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
import { push, ref, set } from 'firebase/database';
import { database } from '../firebase/firebaseConfig';
import { toast } from 'sonner';

const DebitSchema = z.object({
  date: z.date().refine((date) => !isNaN(date.getTime()), {
    message: 'Please select a valid date',
  }),
  narration: z.string().nonempty('Please enter a narration'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
});

export default function AddDebit({
  debit,
  open,
  setOpen,
  debits,
  setDebits,
}: {
  debit?: EnhancedDebit;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  debits: EnhancedDebit[];
  setDebits: Dispatch<SetStateAction<EnhancedDebit[]>>;
}) {
  const form = useForm<z.infer<typeof DebitSchema>>({
    resolver: zodResolver(DebitSchema),
  });

  useEffect(() => {
    if (debit) {
      form.setValue('date', new Date(debit.date));
      form.setValue('narration', debit?.narration);
      form.setValue('amount', debit.amount);
    } else {
      form.reset();
    }
  }, [debit]);

  function onSubmit(formValues: z.infer<typeof DebitSchema>) {
    const addDebit = async () => {
      try {
        const debitsRef = ref(database, 'debits');
        const newDataRef = push(debitsRef);
        await set(newDataRef, {
          date: format(formValues.date, 'yyyy-MM-dd'),
          amount: formValues.amount,
          narration: formValues.narration,
        });
        toast.success('Saved debit');
        const newId = newDataRef.key || generateRandomId();
        const newEntry: Entry = {
          id: newId,
          date: format(formValues.date, 'yyyy-MM-dd'),
          entry_type: 'debit',
          narration: formValues.narration,
          amount: formValues.amount,
        };
        const updatedDebits = [...debits, newEntry];
        setDebits(updatedDebits);
      } catch (e) {
        toast.error('Error saving debit');
      } finally {
        setOpen(false);
      }
    };

    const updateDebit = async (id: string) => {
      try {
        const debitRef = ref(database, `debits/${id}`);
        await set(debitRef, {
          date: format(formValues.date, 'yyyy-MM-dd'),
          narration: formValues.narration,
          amount: formValues.amount,
        });
        const updatedEntry: Entry = {
          id,
          date: format(formValues.date, 'yyyy-MM-dd'),
          entry_type: 'debit',
          narration: formValues.narration,
          amount: formValues.amount,
        };

        setDebits(
          debits.map((entry) => (entry.id === id ? updatedEntry : entry))
        );

        toast.success('Updated debit');
      } catch (e) {
        toast.error('Error updating debit');
      } finally {
        setOpen(false);
      }
    };

    if (!debit) {
      addDebit();
    } else {
      updateDebit(debit.id);
    }
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent>
        <DialogTitle>{debit ? 'Edit Debit' : 'Add Debit'}</DialogTitle>
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
                name="amount"
                render={({ field }) => (
                  <FormItem className="mb-2">
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter amount"
                        value={field.value || ''}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="float-right ml-auto mr-0 mt-4 flex gap-5">
              <Button type="submit">{debit ? 'Update' : 'Save'}</Button>
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
