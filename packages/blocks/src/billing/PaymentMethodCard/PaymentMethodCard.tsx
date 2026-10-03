import { Badge, Button, Card, CardAction, CardDescription, CardHeader, CardTitle, cn, type BadgeTone } from '@gntik-ai/ui';
import { CreditCard } from '@gntik-ai/icons';
import { samplePaymentMethod } from './fixtures';

export type PaymentMethodStatus = 'valid' | 'expiring' | 'expired';

export interface PaymentMethod {
  /** Card network as text, e.g. "Visa", "Mastercard", "Amex". */
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  holder?: string;
  isDefault?: boolean;
  /** Computed by the app (the block never reads the clock). */
  status?: PaymentMethodStatus;
}

export interface PaymentMethodCardProps {
  method?: PaymentMethod;
  title?: string;
  description?: string;
  onUpdate?: () => void;
  onRemove?: () => void;
  updateLabel?: string;
  className?: string;
}

const STATUS: Record<Exclude<PaymentMethodStatus, 'valid'>, { label: string; tone: BadgeTone }> = {
  expiring: { label: 'Expires soon', tone: 'warning' },
  expired: { label: 'Expired', tone: 'destructive' },
};

/** The payment method on file: brand, masked number, expiry and an update action. No card artwork. */
export function PaymentMethodCard({
  method = samplePaymentMethod,
  title = 'Payment method',
  description = 'Charged at the start of each billing cycle.',
  onUpdate,
  onRemove,
  updateLabel = 'Update',
  className,
}: PaymentMethodCardProps) {
  const expiry = `${String(method.expMonth).padStart(2, '0')}/${String(method.expYear).slice(-2)}`;
  const status = method.status && method.status !== 'valid' ? STATUS[method.status] : undefined;
  return (
    <Card className={cn(className)}>
      <CardHeader divided>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        <CardAction className="flex items-center gap-2">
          {onRemove && (
            <Button variant="ghost" size="sm" onClick={onRemove}>
              Remove
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={onUpdate}>
            {updateLabel}
          </Button>
        </CardAction>
      </CardHeader>
      <div className="flex flex-wrap items-center gap-4 px-5 py-4">
        <span
          aria-hidden
          className="grid h-10 w-14 shrink-0 place-items-center rounded-md border border-border bg-secondary font-mono text-[10.5px] font-semibold tracking-wide text-foreground uppercase"
        >
          {method.brand.slice(0, 4)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-[13.5px] font-medium text-foreground">
            <span>
              {method.brand} ending in <span className="font-mono tabular-nums">{method.last4}</span>
            </span>
            {method.isDefault && <Badge tone="neutral">Default</Badge>}
            {status && (
              <Badge tone={status.tone} dot>
                {status.label}
              </Badge>
            )}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <CreditCard size={13} aria-hidden className="shrink-0" />
            Expires <span className="font-mono tabular-nums">{expiry}</span>
            {method.holder && <> · {method.holder}</>}
          </p>
        </div>
      </div>
    </Card>
  );
}
