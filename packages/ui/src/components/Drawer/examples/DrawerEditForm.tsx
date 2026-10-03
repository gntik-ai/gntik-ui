import { Check, Settings } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../Button';
import { Switch } from '../../Switch';
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../Drawer';

const fieldClass =
  'h-9 w-full rounded-md border border-input bg-background px-3 text-[13px] text-foreground shadow-sm focus-visible:outline-2 focus-visible:outline-focus-ring';

export default function DrawerEditForm() {
  const [open, setOpen] = useState(false);
  const [retries, setRetries] = useState(true);
  return (
    <Drawer side="right" open={open} onOpenChange={setOpen}>
      <DrawerTrigger render={<Button variant="secondary" icon={Settings} />}>Edit project</DrawerTrigger>
      <DrawerContent size="md">
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            setOpen(false);
          }}
        >
          <DrawerHeader>
            <DrawerTitle>Edit project</DrawerTitle>
            <DrawerDescription>support-triage · production</DrawerDescription>
          </DrawerHeader>
          <DrawerBody className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[12.5px] font-medium text-foreground">Name</span>
              <input defaultValue="support-triage" className={fieldClass} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[12.5px] font-medium text-foreground">Region</span>
              <select defaultValue="eu-west-1" className={fieldClass}>
                <option>eu-west-1</option>
                <option>us-east-1</option>
                <option>ap-south-1</option>
              </select>
            </label>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-3.5 py-3">
              <div>
                <div id="retries-label" className="text-[12.5px] font-medium text-foreground">Automatic retries</div>
                <div className="mt-0.5 text-[11.5px] leading-4 text-muted-foreground">Retry failed deployments three times with backoff.</div>
              </div>
              <Switch aria-labelledby="retries-label" checked={retries} onCheckedChange={setRetries} />
            </div>
          </DrawerBody>
          <DrawerFooter>
            <DrawerClose render={<Button variant="ghost" />}>Cancel</DrawerClose>
            <Button type="submit" icon={Check}>
              Save changes
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
