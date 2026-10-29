export function parsePalette(css: string): Record<string, string>[];
export function readPalettes(read: (file: string) => string): Record<string, Record<string, string>[]>;
