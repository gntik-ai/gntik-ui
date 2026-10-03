/** Copy and links for the status pages (403 · 404 · 500 · maintenance). */
export const supportHref = 'mailto:support@acme.example';

export const forbidden = { resource: 'the billing-service project', owner: 'Jamie Chen', signedInAs: 'alex@acme.example' };

export const serverError = { requestId: 'req_7d2a19c0e4b8', details: 'GET /api/projects/web-app\n500 Internal Server Error' };

export const maintenance = {
  description: 'We are upgrading the Acme database. Running projects are not affected; the console is read-only until 14:30 UTC.',
  bannerMessage: 'Started 13:00 UTC · expected to end 14:30 UTC.',
};
