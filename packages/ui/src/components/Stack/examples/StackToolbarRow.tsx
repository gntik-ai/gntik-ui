import { Badge } from '../../Badge';
import { Button } from '../../Button';
import { HStack, VStack } from '../Stack';

export default function StackToolbarRow() {
  return (
    <VStack gap={4} className="max-w-[520px] rounded-xl border border-border bg-card p-5">
      <HStack justify="between" gap={3} wrap>
        <VStack gap={1}>
          <span className="text-[15px] font-semibold tracking-tight text-foreground">Deployments</span>
          <span className="text-[13px] text-muted-foreground">12 running across 3 regions.</span>
        </VStack>
        <HStack gap={2}>
          <Button variant="secondary" size="sm">Export</Button>
          <Button size="sm">New deployment</Button>
        </HStack>
      </HStack>
      <HStack gap={2} wrap>
        <Badge>production</Badge>
        <Badge>staging</Badge>
        <Badge>preview</Badge>
      </HStack>
    </VStack>
  );
}
