import type { LightboxItem } from '../Lightbox';

// Neutral illustrations in the default fill at low opacity, so they read on every theme.
const svg = (body: string) =>
  'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100"><rect width="160" height="100" fill-opacity="0.08"/>${body}</svg>`);

export const media: LightboxItem[] = [
  { src: svg('<rect x="14" y="14" width="40" height="72" rx="4" fill-opacity="0.2"/><rect x="62" y="14" width="84" height="32" rx="4" fill-opacity="0.28"/><rect x="62" y="54" width="84" height="32" rx="4" fill-opacity="0.16"/>'), alt: 'Dashboard overview with sidebar and two panels', caption: 'Dashboard · overview' },
  { src: svg('<path d="M10 80 L40 52 L64 66 L96 30 L124 46 L150 20" fill="none" stroke="currentColor" stroke-opacity="0.4" stroke-width="4"/>'), alt: 'Usage chart trending up over the month', caption: 'Usage · last 30 days' },
  { src: svg('<circle cx="80" cy="50" r="30" fill-opacity="0.22"/><circle cx="80" cy="50" r="14" fill-opacity="0.3"/>'), alt: 'Deployment status ring', caption: 'Deployments · status' },
  { src: svg('<rect x="20" y="20" width="120" height="12" rx="3" fill-opacity="0.25"/><rect x="20" y="40" width="96" height="12" rx="3" fill-opacity="0.18"/><rect x="20" y="60" width="108" height="12" rx="3" fill-opacity="0.18"/>'), alt: 'Invoice list with three rows', caption: 'Billing · invoices' },
];
