import assert from 'node:assert/strict';
import test from 'node:test';
import { NextRequest } from 'next/server.js';
import { proxy } from '../proxy.ts';

test('the request interceptor gives Next and the browser the same strict policy and a fresh nonce', () => {
  const request = new NextRequest('https://example.test/csp', { headers: { 'x-nonce': 'untrusted' } });
  const first = proxy(request);
  const policy = first.headers.get('Content-Security-Policy');
  const nonce = first.headers.get('x-middleware-request-x-nonce');
  assert.match(nonce, /^[A-Za-z0-9+/]{22}==$/);
  assert.match(
    policy,
    new RegExp(`script-src 'nonce-${nonce.replace(/[+]/g, '\\+').replace(/[/]/g, '\\/')}' 'strict-dynamic'`),
  );
  assert.ok(policy.includes(`style-src-elem 'self' 'nonce-${nonce}'`));
  assert.ok(policy.includes("style-src-attr 'unsafe-inline'"));
  assert.ok(!policy.includes('unsafe-eval'));
  assert.equal(first.headers.get('x-middleware-request-content-security-policy'), policy);
  assert.notEqual(nonce, proxy(request).headers.get('x-middleware-request-x-nonce'));
});
