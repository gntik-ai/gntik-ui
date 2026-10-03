import { sampleInvoices, samplePaymentMethod, samplePlan, sampleQuotas, type BillingPlan, type Invoice, type PaymentMethod, type Quota } from '@gntik-ai/blocks';

export const plan: BillingPlan = samplePlan;
export const quotas: Quota[] = sampleQuotas;
export const paymentMethod: PaymentMethod = samplePaymentMethod;
export const invoices: Invoice[] = sampleInvoices;
