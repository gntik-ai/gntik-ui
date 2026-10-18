import { tv, type VariantProps } from '../../utils/tv';
import { timePickerVariants } from '../TimePicker/time-picker.variants';

export const dateFieldVariants = tv({ extend: timePickerVariants });
export type DateFieldVariantProps = VariantProps<typeof dateFieldVariants>;
