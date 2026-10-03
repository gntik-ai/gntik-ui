export const buttons = `import { useState } from 'react';
import { Button, IconButton, Card, CardBody, CardHeader, CardTitle, CardDescription } from '@gntik-ai/ui';
import { Plus, Rocket, Trash2, Settings } from '@gntik-ai/icons';

const VARIANTS = ['primary', 'secondary', 'soft', 'ghost', 'destructive'] as const;

export default function App() {
  const [deploying, setDeploying] = useState(false);

  const deploy = () => {
    setDeploying(true);
    setTimeout(() => setDeploying(false), 1500);
  };

  return (
    <div className="grid gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Button variants</CardTitle>
          <CardDescription>One primary action per view; the rest step down.</CardDescription>
        </CardHeader>
        <CardBody className="flex flex-wrap items-center gap-3">
          {VARIANTS.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant[0]!.toUpperCase() + variant.slice(1)}
            </Button>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sizes, icons and loading</CardTitle>
        </CardHeader>
        <CardBody className="flex flex-wrap items-center gap-3">
          <Button size="sm" icon={Plus}>New project</Button>
          <Button size="md" icon={Rocket} loading={deploying} onClick={deploy}>
            {deploying ? 'Deploying…' : 'Deploy'}
          </Button>
          <Button size="lg" variant="secondary">Large</Button>
          <IconButton icon={Settings} label="Settings" />
          <IconButton icon={Trash2} label="Delete" variant="destructive" />
        </CardBody>
      </Card>
    </div>
  );
}
`;
