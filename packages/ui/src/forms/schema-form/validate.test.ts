import { issuesToErrors } from '../schemaResolver';
import { createFormatters, en, es } from '../../i18n';
import { validate } from './validate';
import { prepareValues } from './values';
import type { JsonSchema } from './types';

const t = createFormatters('en', en).t;
it('validates nested objects and array items at their public error paths', () => {
  const schema: JsonSchema = {
    type: 'object',
    properties: {
      auth: { type: 'object', required: ['token'], properties: { token: { type: 'string' } } },
      headers: { type: 'array', items: { type: 'object', properties: { count: { type: 'integer', minimum: 1 } } } },
    },
  };
  expect(validate(schema, { auth: {}, headers: [{ count: 0 }] }, t)).toEqual([
    { path: ['auth', 'token'], code: 'required', message: 'Required' },
    { path: ['headers', 0, 'count'], code: 'minimum', message: 'Enter 1 or more.' },
  ]);
});
it('applies defaults, coerces numbers and omits empty optional strings and arrays', () => {
  expect(
    prepareValues(
      {
        type: 'object',
        properties: {
          query: { type: 'string' },
          limit: { type: 'integer', default: 10 },
          safe: { type: 'boolean', default: true },
          region: { enum: ['us', 'eu', 'apac'] },
          tags: { type: 'array', items: { type: 'string' } },
          note: { type: 'string' },
        },
      },
      { query: 'gntik', region: 'eu', tags: [], note: '' },
    ),
  ).toEqual({ query: 'gntik', limit: 10, safe: true, region: 'eu' });
  expect(prepareValues({ type: 'integer' }, '12')).toBe(12);
});
it.each([
  [{ type: 'string', minLength: 2 }, 'a', 'Enter at least 2 characters.', 'Introduce al menos 2 caracteres.'],
  [{ type: 'string', maxLength: 2 }, 'abc', 'Enter 2 characters or fewer.', 'Introduce 2 caracteres o menos.'],
  [{ type: 'number', maximum: 50 }, 60, 'Enter 50 or less.', 'Introduce 50 o menos.'],
  [{ type: 'number', minimum: 1 }, 0, 'Enter 1 or more.', 'Introduce 1 o más.'],
  [{ type: 'string', pattern: '^a$' }, 'b', 'Use the expected format.', 'Usa el formato esperado.'],
  [{ type: 'string', format: 'email' }, 'oops', 'Enter a valid email address.', 'Introduce un correo válido.'],
  [{ type: 'string', format: 'uri' }, 'oops', 'Enter a valid URL.', 'Introduce una URL válida.'],
  [{ type: 'string', format: 'date' }, '2026-02-30', 'Enter a valid date.', 'Introduce una fecha válida.'],
  [{ type: 'array', minItems: 1 }, [], 'Add at least 1 item.', 'Añade al menos 1 elemento.'],
  [{ type: 'array', maxItems: 2 }, [1, 2, 3], 'Add 2 items or fewer.', 'Añade 2 elementos o menos.'],
  [{ type: 'array', uniqueItems: true }, ['a', 'a'], 'Use unique items.', 'Usa elementos únicos.'],
  [{ type: 'integer' }, 1.5, 'Enter a valid integer.', 'Introduce un entero válido.'],
  [{ enum: ['a', 'b'] }, 'c', 'Choose a listed value.', 'Elige un valor de la lista.'],
  [{ const: 'a' }, 'b', 'Choose a listed value.', 'Elige un valor de la lista.'],
  [{ type: 'number', multipleOf: 2 }, 3, 'Enter a multiple of 2.', 'Introduce un múltiplo de 2.'],
] as const)('validates %j in English and Spanish', (schema, value, english, spanish) => {
  expect(validate(schema, value, t)[0]?.message).toBe(english);
  expect(validate(schema, value, createFormatters('es', es).t)[0]?.message).toBe(spanish);
});
it('caps pattern input before running the regex, including when maxLength is absent', () => {
  const test = vi.spyOn(RegExp.prototype, 'test');
  expect(validate({ type: 'string', pattern: '^a+$' }, 'a'.repeat(1001), t)[0]?.code).toBe('maxLength');
  expect(test).not.toHaveBeenCalled();
  expect(validate({ type: 'string', pattern: '^a+$', maxLength: 3 }, 'aaaa', t)[0]?.code).toBe('maxLength');
  expect(test).not.toHaveBeenCalled();
  expect(validate({ type: 'string', pattern: '^a+$' }, 'aaa', t)).toEqual([]);
  expect(test).toHaveBeenCalled();
  test.mockRestore();
  expect(() => validate({ type: 'string', pattern: '[' }, 'x', t)).not.toThrow();
});
it('resolves local refs and parses JSON fallbacks without trusting unsupported keywords', () => {
  const schema: JsonSchema = {
    type: 'object',
    $defs: { header: { type: 'object', required: ['name'], properties: { name: { type: 'string' } } } },
    properties: { header: { $ref: '#/$defs/header' }, config: { if: {}, then: {} } },
  };
  expect(validate(schema, { header: {}, config: '{oops' }, t).map((i) => [i.path, i.code])).toEqual([
    [['header', 'name'], 'required'],
    [['config'], 'json'],
  ]);
  expect(prepareValues(schema, { header: { name: 'x' }, config: '{"ok":true}' })).toEqual({
    header: { name: 'x' },
    config: { ok: true },
  });
});

it('maps untrusted schema property names without mutating object prototypes', () => {
  const schema: JsonSchema = {
    type: 'object',
    properties: Object.fromEntries([
      [
        '__proto__',
        {
          type: 'object',
          required: ['__schemaFormRegressionToken'],
          properties: { __schemaFormRegressionToken: { type: 'string' } },
        },
      ],
    ]),
  };
  try {
    const errors = issuesToErrors(validate(schema, {}, t));
    expect(Object.hasOwn(Object.prototype, '__schemaFormRegressionToken')).toBe(false);
    expect(Object.hasOwn(errors, '__proto__')).toBe(true);
    expect(Object.getOwnPropertyDescriptor(errors, '__proto__')?.value).toMatchObject({
      __schemaFormRegressionToken: { message: 'Required' },
    });
  } finally {
    Reflect.deleteProperty(Object.prototype, '__schemaFormRegressionToken');
  }
});

it('validates empty string array items instead of treating them as omitted properties', () => {
  expect(validate({ type: 'array', items: { type: 'string', minLength: 1 } }, [''], t)).toEqual([
    { path: [0], code: 'minLength', message: 'Enter at least 1 character.' },
  ]);
});
