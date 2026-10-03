import { Info } from 'lucide-react';
import { Field, FieldDescription, FieldLabel } from '../../Field';
import { Textarea } from '../Textarea';

export default function TextareaAutosize() {
  return (
    <div className="grid max-w-3xl grid-cols-1 gap-x-10 gap-y-3 md:grid-cols-3">
      <Field className="contents">
        <div>
          <FieldLabel className="font-semibold">Project description</FieldLabel>
          <p className="mt-1 text-[13px] leading-6 text-muted-foreground">Grows with its content.</p>
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <Textarea
            autosize
            defaultValue="Customer-facing billing dashboard. Owns invoices, payment methods and usage reports for every workspace."
            placeholder="Describe what this project does…"
          />
          <FieldDescription className="flex items-center gap-1.5">
            <Info size={13} aria-hidden className="shrink-0" />
            Versioned on every save; you can revert from the history.
          </FieldDescription>
        </div>
      </Field>
    </div>
  );
}
