import { Field, FieldDescription, FieldError, FieldLabel } from '../../Field';
import { MultiSelect } from '../MultiSelect';

const projects = ['Billing API', 'Customer portal', 'Data pipeline', 'Mobile app', 'Status page'].map((label) => ({
  value: label.toLowerCase().replace(/\s+/g, '-'),
  label,
}));

export default function MultiSelectField() {
  return (
    <div className="grid max-w-3xl grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
      <Field>
        <FieldLabel>Projects</FieldLabel>
        <MultiSelect options={projects} defaultValue={['billing-api']} size="sm" showSelectAll={false} name="projects" />
        <FieldDescription>The member can deploy to these projects.</FieldDescription>
      </Field>
      <Field invalid>
        <FieldLabel>Notify projects</FieldLabel>
        <MultiSelect options={projects} invalid placeholder="Pick at least one…" />
        <FieldError match>Select at least one project.</FieldError>
      </Field>
    </div>
  );
}
