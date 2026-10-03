import { connection } from 'next/server';

/**
 * Request time, for Server Components that anchor relative dates. `connection()` opts the route
 * into per-request rendering, so the anchor (and the "5 min ago" labels) match what hydrates.
 */
export async function requestTime() {
  await connection();
  return Date.now();
}
