import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../Button';
import { Popover, PopoverClose, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from '../Popover';

export default function PopoverForm() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="secondary" icon={UserPlus} />}>Invite member</PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setOpen(false);
          }}
        >
          <PopoverTitle>Invite a member</PopoverTitle>
          <PopoverDescription>They get an email with a link to join this workspace.</PopoverDescription>
          <label className="mt-3 block">
            <span className="mb-1.5 block text-[12.5px] font-medium text-foreground">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-focus-ring"
            />
          </label>
          <div className="mt-3.5 flex justify-end gap-2">
            <PopoverClose render={<Button size="sm" variant="ghost" />}>Cancel</PopoverClose>
            <Button size="sm" type="submit">
              Send invite
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
