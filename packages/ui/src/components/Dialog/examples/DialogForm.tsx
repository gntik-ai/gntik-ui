import { useState } from 'react';
import { Button } from '../../Button';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../Dialog';

export default function DialogForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('support-triage');
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>New project</DialogTrigger>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setOpen(false);
          }}
        >
          <DialogHeader>
            <DialogTitle>Create project</DialogTitle>
            <DialogDescription>Name it; you can change the settings later.</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <label className="block">
              <span className="mb-1.5 block text-[12.5px] font-medium text-foreground">Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-[13px] text-foreground focus-visible:outline-2 focus-visible:outline-focus-ring"
              />
            </label>
          </DialogBody>
          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
