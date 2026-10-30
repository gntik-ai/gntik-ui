import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Card',
  group: 'Layout',
  status: 'stable',
  anatomy: `<Card>
  <CardHeader>
    <CardTitle>Details</CardTitle>
    <CardDescription>Review the details.</CardDescription>
    <CardAction>Action</CardAction>
  </CardHeader>
  <CardBody>Content</CardBody>
  <CardFooter>Footer</CardFooter>
</Card>`,
  description:
    'The base content surface: border, token radius, generous padding and a flat shadow. Parts: Card, CardHeader (optionally divided), CardTitle, CardDescription, CardAction (header right slot), CardBody and CardFooter. Variants: default, well and outline.',
  tokens: ['card', 'card-foreground', 'border', 'secondary', 'muted-foreground', 'shadow-sm', 'radius-xl'],
};
