/** How a URL update changes browser history. */
export type UrlHistoryMode = 'push' | 'replace';
/** Options shared by URL codecs. */
export interface UrlParamOptions {
  history?: UrlHistoryMode;
  min?: number;
  max?: number;
}
/** A typed query parameter. Parsers throw on invalid input; the hook supplies the default. */
export interface UrlParam<T> {
  default: T;
  history?: UrlHistoryMode;
  parse(values: readonly string[]): T;
  serialize(value: T): string[];
}
function scalar<T>(
  defaultValue: T,
  parse: (raw: string) => T,
  serialize: (value: T) => string,
  options: UrlParamOptions = {},
): UrlParam<T> {
  return {
    default: defaultValue,
    history: options.history,
    parse: (values) => parse(values[0] ?? ''),
    serialize: (value) => [serialize(value)],
  };
}
/** Typed query codecs; invalid scalar values fall back and invalid array items are dropped. */
export const urlParam = {
  string(defaultValue = '', options: UrlParamOptions = {}): UrlParam<string> {
    return scalar(defaultValue, (raw) => raw, String, options);
  },
  integer(defaultValue = 1, options: UrlParamOptions = {}): UrlParam<number> {
    return scalar(
      defaultValue,
      (raw) => {
        const value = Number(raw);
        if (
          !/^-?\d+$/.test(raw) ||
          !Number.isSafeInteger(value) ||
          (options.min !== undefined && value < options.min) ||
          (options.max !== undefined && value > options.max)
        )
          throw new Error('Invalid integer');
        return value;
      },
      String,
      options,
    );
  },
  boolean(defaultValue = false, options: UrlParamOptions = {}): UrlParam<boolean> {
    return scalar(
      defaultValue,
      (raw) => {
        if (raw !== 'true' && raw !== 'false') throw new Error('Invalid boolean');
        return raw === 'true';
      },
      String,
      options,
    );
  },
  enum<const T extends string>(values: readonly T[], defaultValue: T, options: UrlParamOptions = {}): UrlParam<T> {
    return scalar(
      defaultValue,
      (raw) => {
        const value = values.find((value) => value === raw);
        if (value === undefined) throw new Error('Invalid enum');
        return value;
      },
      String,
      options,
    );
  },
  custom<T>(options: {
    default: T;
    parse(raw: string): T;
    serialize(value: T): string;
    history?: UrlHistoryMode;
  }): UrlParam<T> {
    return scalar(options.default, options.parse, options.serialize, options);
  },
  array<T>(item: UrlParam<T>, options: UrlParamOptions = {}): UrlParam<T[]> {
    return {
      default: [],
      history: options.history,
      parse: (values) =>
        values.flatMap((value) => {
          try {
            return [item.parse([value])];
          } catch {
            return [];
          }
        }),
      serialize: (values) => values.flatMap((value) => item.serialize(value)),
    };
  },
};
