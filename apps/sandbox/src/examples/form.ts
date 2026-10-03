export const form = `import { useState } from 'react';
import {
  Button, Card, CardBody, CardFooter, CardHeader, CardTitle, CardDescription,
  Checkbox, Field, FieldDescription, FieldError, FieldLabel, Input, SimpleSelect, Textarea, useToast,
} from '@gntik-ai/ui';

const REGIONS = [
  { value: 'eu-west', label: 'EU West · Frankfurt' },
  { value: 'us-east', label: 'US East · Virginia' },
  { value: 'ap-south', label: 'AP South · Singapore' },
];

export default function App() {
  const toast = useToast();
  const [name, setName] = useState('billing-api');
  const [region, setRegion] = useState<string | null>('eu-west');
  const [submitted, setSubmitted] = useState(false);
  const invalid = submitted && !/^[a-z0-9-]{3,}$/.test(name);

  return (
    <div className="p-6">
      <Card className="mx-auto max-w-lg">
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
            if (/^[a-z0-9-]{3,}$/.test(name)) toast.add({ tone: 'success', title: 'Project created', description: name + ' in ' + region });
          }}
        >
          <CardHeader>
            <CardTitle>New project</CardTitle>
            <CardDescription>Projects group deployments, keys and members.</CardDescription>
          </CardHeader>
          <CardBody className="grid gap-5">
            <Field invalid={invalid}>
              <FieldLabel required>Project name</FieldLabel>
              <Input value={name} onValueChange={setName} />
              <FieldDescription>Lowercase letters, numbers and dashes.</FieldDescription>
              <FieldError match={invalid}>Use at least 3 lowercase letters, numbers or dashes.</FieldError>
            </Field>
            <SimpleSelect label="Region" items={REGIONS} value={region} onValueChange={setRegion} />
            <Field>
              <FieldLabel>Description</FieldLabel>
              <Textarea rows={3} placeholder="What does this project serve?" />
            </Field>
            <Checkbox defaultChecked label="Enable preview deployments" description="Every pull request gets its own URL." />
          </CardBody>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="ghost" type="reset">Cancel</Button>
            <Button type="submit">Create project</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
`;
