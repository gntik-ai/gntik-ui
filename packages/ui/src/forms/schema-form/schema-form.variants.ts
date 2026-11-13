import { tv } from '../../utils/tv';
export const schemaFormVariants = tv({
  slots: { form: 'grid gap-5', fields: 'grid min-w-0 gap-4', group: 'min-w-0 space-y-4', wide: 'col-span-full' },
  variants: { columns: { 1: { fields: 'grid-cols-1' }, 2: { fields: 'grid-cols-1 sm:grid-cols-2' } } },
  defaultVariants: { columns: 1 },
});
