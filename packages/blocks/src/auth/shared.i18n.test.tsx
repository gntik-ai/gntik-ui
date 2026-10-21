import { act, renderHook } from '@testing-library/react';
import { I18nProvider, useI18n } from '@gntik-ai/ui';
import { authIdentifierError, authSignUpFieldError, useAsyncSubmit } from './shared';
import type { ReactNode } from 'react';
const wrapper = ({ children }: { children: ReactNode }) => <I18nProvider locale="es">{children}</I18nProvider>;
it('preserves legacy helper signatures and English outputs', () => {
  expect(authIdentifierError('')).toBe('Enter a valid email address.');
  expect(authIdentifierError('', { type: 'text' })).toBe('Enter a valid identifier.');
  expect(authSignUpFieldError('', { id: 'name', label: 'Full name', required: true })).toBe('Enter Full name.');
  expect(authSignUpFieldError('bad', { id: 'email', label: 'Email', type: 'email' })).toBe(
    'Enter a valid email address.',
  );
});
it('accepts a provider translator and keeps explicit validation messages first', () => {
  const { result } = renderHook(() => useI18n(), { wrapper });
  expect(authIdentifierError('', undefined, undefined, result.current.t)).toBe(
    'Introduce una dirección de correo válida.',
  );
  expect(authIdentifierError('x', { type: 'text', minLength: 3 }, undefined, result.current.t)).toBe(
    'Introduce un identificador válido.',
  );
  expect(authSignUpFieldError('', { id: 'name', label: 'Nombre', required: true }, result.current.t)).toBe(
    'Introduce Nombre.',
  );
  expect(authSignUpFieldError('bad', { id: 'email', label: 'Email', type: 'email' }, result.current.t)).toBe(
    'Introduce una dirección de correo válida.',
  );
  expect(authIdentifierError('', undefined, { identifierRequired: 'Explicit required' }, result.current.t)).toBe(
    'Explicit required',
  );
  expect(
    authSignUpFieldError(
      '',
      { id: 'name', label: 'Nombre', required: true, messages: { required: 'Explicit field' } },
      result.current.t,
    ),
  ).toBe('Explicit field');
});
it('localises non-Error async rejections and honours explicit fallback', async () => {
  const { result, rerender } = renderHook(({ fallback }: { fallback?: string }) => useAsyncSubmit(fallback), {
    wrapper,
    initialProps: { fallback: undefined as string | undefined },
  });
  await act(async () => {
    await result.current.run(() => Promise.reject(null));
  });
  expect(result.current.error).toBe('Algo salió mal. Inténtalo de nuevo.');
  rerender({ fallback: 'Explicit failure' });
  await act(async () => {
    await result.current.run(() => Promise.reject(null));
  });
  expect(result.current.error).toBe('Explicit failure');
  await act(async () => {
    await result.current.run(() => Promise.reject(new Error('Server message')));
  });
  expect(result.current.error).toBe('Server message');
});

it('resolves explicit validation fallbacks before labels and treats undefined as absent', () => {
  expect(
    authIdentifierError('', undefined, { identifierRequired: undefined }, undefined, {
      identifierRequired: 'Custom required',
    }),
  ).toBe('Custom required');
  expect(
    authIdentifierError('x', { type: 'text', minLength: 3 }, { identifierInvalid: 'Explicit invalid' }, undefined, {
      identifierTooShort: 'Custom short',
    }),
  ).toBe('Explicit invalid');
  expect(authSignUpFieldError('', { id: 'literal', label: '$&', required: true })).toBe('Enter $&.');
});
