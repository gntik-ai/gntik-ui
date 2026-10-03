/** Neutral fixtures for the 500 page. */
export const serverErrorContent = {
  code: '500 · Server error',
  title: 'Something went wrong on our side',
  description: 'The page failed to load. Nothing you did caused this, and your data is safe.',
  panelTitle: 'The request failed',
  panelMessage: 'An unexpected error interrupted the request. Try again; if it keeps happening, share the request ID with support.',
  errorCode: 500,
  requestId: 'req_3b91e6c2f04d',
  details: 'GET /v1/projects/web-app/overview\n500 Internal Server Error\nunhandled exception in handler (trace: 7c1e9a42)',
  homeLabel: 'Go to dashboard',
  homeHref: '/',
  statusLabel: 'System status',
  statusHref: '/status',
};

/** Simulated retry for the standalone page. */
export const simulateRetry = () => new Promise<void>((resolve) => setTimeout(resolve, 1200));
