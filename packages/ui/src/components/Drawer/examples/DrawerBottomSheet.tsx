import { Copy, Share2 } from 'lucide-react';
import { Button } from '../../Button';
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

export default function DrawerBottomSheet() {
  return (
    <Drawer side="bottom">
      <DrawerTrigger render={<Button variant="secondary" icon={Share2} />}>Share project</DrawerTrigger>
      <DrawerContent size="md">
        <DrawerHeader>
          <DrawerTitle>Share project</DrawerTitle>
          <DrawerDescription>Anyone with the link and a workspace seat can view it.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
            <span className="min-w-0 flex-1 truncate font-mono text-[12.5px] text-foreground">https://example.com/p/support-triage</span>
            <Button size="sm" variant="soft" icon={Copy}>
              Copy link
            </Button>
          </div>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose render={<Button variant="ghost" />}>Done</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
