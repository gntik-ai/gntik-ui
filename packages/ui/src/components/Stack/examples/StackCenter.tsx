import { Inbox } from 'lucide-react';
import { Center, VStack } from '../Stack';

export default function StackCenter() {
  return (
    <Center className="h-48 max-w-[520px] rounded-xl border border-dashed border-border">
      <VStack gap={2} align="center">
        <Center inline className="size-10 rounded-lg bg-secondary text-muted-foreground">
          <Inbox size={18} aria-hidden />
        </Center>
        <span className="text-[13px] text-muted-foreground">No invoices yet</span>
      </VStack>
    </Center>
  );
}
