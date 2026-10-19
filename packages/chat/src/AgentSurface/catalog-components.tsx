import {
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Heading,
  Input,
  Link,
  SimpleSelect,
  Stack,
  Text,
  type HeadingLevel,
  type SpaceScale,
} from '@gntik-ai/ui';
import type { AgentCatalogRenderProps } from './catalog';
import { isRecord } from './model';

const text = (value: unknown) => (typeof value === 'string' ? value : '');

export function SurfaceText({ props }: AgentCatalogRenderProps) {
  return typeof props.href === 'string' && props.href ? (
    <Text>
      <Link href={props.href}>{text(props.text)}</Link>
    </Text>
  ) : (
    <Text>{text(props.text)}</Text>
  );
}
export function SurfaceHeading({ props }: AgentCatalogRenderProps) {
  return (
    <Heading level={typeof props.level === 'number' ? (props.level as HeadingLevel) : 2}>{text(props.text)}</Heading>
  );
}
export function SurfaceCard({ children }: AgentCatalogRenderProps) {
  return <Card className="space-y-3 p-4">{children}</Card>;
}
export function SurfaceStack({ props, children }: AgentCatalogRenderProps) {
  return (
    <Stack
      direction={props.direction === 'row' ? 'row' : 'column'}
      gap={typeof props.gap === 'number' ? (props.gap as SpaceScale) : 3}
    >
      {children}
    </Stack>
  );
}
export function SurfaceButton({ props, onAction }: AgentCatalogRenderProps) {
  return (
    <Button
      type="submit"
      className="motion-reduce:transition-none"
      disabled={props.disabled === true}
      onClick={onAction}
    >
      {text(props.label)}
    </Button>
  );
}
export function SurfaceInput({ props, onValueChange }: AgentCatalogRenderProps) {
  return (
    <label className="flex flex-col gap-2 text-sm text-foreground">
      {text(props.label)}
      <Input type="text" disabled={props.disabled === true} value={text(props.value)} onValueChange={onValueChange} />
    </label>
  );
}
export function SurfaceSelect({ props, onValueChange }: AgentCatalogRenderProps) {
  const items = Array.isArray(props.options)
    ? props.options.filter(isRecord).map((item) => ({ value: text(item.value), label: text(item.label) }))
    : [];
  return (
    <SimpleSelect<string>
      label={text(props.label)}
      disabled={props.disabled === true}
      value={typeof props.value === 'string' ? props.value : null}
      items={items}
      onValueChange={onValueChange}
    />
  );
}
export function SurfaceCheckbox({ props, onValueChange }: AgentCatalogRenderProps) {
  return (
    <Checkbox
      label={text(props.label)}
      disabled={props.disabled === true}
      checked={props.checked === true}
      onCheckedChange={onValueChange}
    />
  );
}
export function SurfaceAlert({ props }: AgentCatalogRenderProps) {
  return <Alert title={text(props.title)} description={text(props.text)} />;
}
export function SurfaceBadge({ props }: AgentCatalogRenderProps) {
  return <Badge>{text(props.text)}</Badge>;
}
