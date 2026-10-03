import { InvoiceTable, PaymentMethodCard, PlanCard, QuotaMeters, type BillingCycle, type BillingPlan, type Invoice, type PaymentMethod, type Quota } from '@gntik-ai/blocks';
import { Section } from '@gntik-ai/ui';
import { SettingsFrame, type SettingsFrameOptions } from '../settings-profile/SettingsFrame';
import { invoices as defaultInvoices, paymentMethod as defaultPaymentMethod, plan as defaultPlan, quotas as defaultQuotas } from './data';

export interface SettingsBillingProps extends SettingsFrameOptions {
  plan: BillingPlan;
  quotas: Quota[];
  paymentMethod: PaymentMethod;
  invoices: Invoice[];
  /** ISO 4217 code for the invoice table. */
  currency: string;
  onUpgrade: () => void;
  onManagePlan: () => void;
  onCycleChange: (cycle: BillingCycle) => void;
  onUpdatePaymentMethod: () => void;
  onDownloadInvoice: (invoice: Invoice) => void;
}

/** Billing settings: PlanCard, QuotaMeters, PaymentMethodCard and InvoiceTable. */
export default function SettingsBillingPage({
  plan = defaultPlan,
  quotas = defaultQuotas,
  paymentMethod = defaultPaymentMethod,
  invoices = defaultInvoices,
  currency = 'USD',
  onUpgrade,
  onManagePlan,
  onCycleChange,
  onUpdatePaymentMethod,
  onDownloadInvoice,
  ...frame
}: Partial<SettingsBillingProps>) {
  return (
    <SettingsFrame page="billing" width="wide" description="Your plan, usage this cycle, payment method and invoices." {...frame}>
      <Section title="Plan">
        <PlanCard plan={plan} onUpgrade={onUpgrade} onManage={onManagePlan} onCycleChange={onCycleChange} />
      </Section>
      <Section title="Usage" description="Resets at the start of each billing cycle.">
        <QuotaMeters quotas={quotas} title="Plan quotas" />
      </Section>
      <Section title="Payment">
        <PaymentMethodCard method={paymentMethod} description="Charged on the first day of each cycle." onUpdate={onUpdatePaymentMethod} />
      </Section>
      <Section title="Invoices">
        <InvoiceTable invoices={invoices} currency={currency} onDownload={onDownloadInvoice} />
      </Section>
    </SettingsFrame>
  );
}
