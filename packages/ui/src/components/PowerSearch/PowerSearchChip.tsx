import { X } from 'lucide-react';
import type { KeyboardEvent } from 'react';
import { cn } from '../../utils/cn';
import { powerSearchVariants } from './power-search.variants';

const s = powerSearchVariants();

export interface PowerSearchChipProps {
  /** Field label, operator symbol and value (filters) or just the text. */
  field?: string;
  operator?: string;
  value: string;
  /** Spoken form, e.g. "Status is failed". */
  description: string;
  removeLabel: string;
  editHint: string;
  index: number;
  disabled?: boolean;
  onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void;
  onEdit: () => void;
  onRemove: () => void;
}

/** One committed term. The body is reachable with ArrowLeft from the input (roving), not Tab. */
export function PowerSearchChip({ field, operator, value, description, removeLabel, editHint, index, disabled, onKeyDown, onEdit, onRemove }: PowerSearchChipProps) {
  return (
    <span role="listitem" className={cn(s.chip(), !field && s.chipText())}>
      <button
        type="button"
        tabIndex={-1}
        data-chip-body=""
        data-chip-index={index}
        disabled={disabled}
        aria-label={`${description}. ${editHint}`}
        className={s.chipBody()}
        onKeyDown={onKeyDown}
        onClick={onEdit}
      >
        {field && <span className={s.chipField()}>{field}</span>}
        {operator && <span className={s.chipOp()}>{operator}</span>}
        <span className="truncate">{value}</span>
      </button>
      <button type="button" tabIndex={-1} aria-label={removeLabel} disabled={disabled} className={s.chipRemove()} onClick={onRemove}>
        <X size={11} strokeWidth={2.4} aria-hidden />
      </button>
    </span>
  );
}
