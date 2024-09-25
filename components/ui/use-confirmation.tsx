import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './alert-dialog';

export function ConfirmationDialog({
  open,
  title,
  description,
  onClose,
  onConfirm,
  onOpenChange,
}: {
  open: boolean;
  title: React.ReactNode;
  description: React.ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  onOpenChange: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl">{title}</AlertDialogTitle>
          <AlertDialogDescription className="pt-1 text-base">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function useConfirmation() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState<React.ReactNode>('');
  const [description, setDescription] = useState<React.ReactNode>('');
  const [onConfirm, setOnConfirm] = useState<() => void>(() => void 0);
  const [onClose, setOnClose] = useState<() => void>(() => void 0);

  function confirm({
    title,
    description,
    onConfirm,
  }: {
    title: React.ReactNode;
    description: React.ReactNode;
    onConfirm: () => void;
  }) {
    setTitle(title);
    setDescription(description);
    setOnConfirm(() => onConfirm);
    setOnClose(() => () => setOpen(false));
    setOpen(true);
  }

  return {
    confirm,
    dialogProps: {
      open,
      title,
      description,
      onConfirm,
      onClose,
      onOpenChange: () => setOpen(!open),
    },
  };
}
