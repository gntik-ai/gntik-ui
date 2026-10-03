import { Button } from '../../Button';
import { Card, CardAction, CardBody, CardDescription, CardFooter, CardHeader, CardTitle } from '../Card';

export default function CardWithHeader() {
  return (
    <Card className="max-w-[420px]">
      <CardHeader divided>
        <CardTitle>Retry policy</CardTitle>
        <CardDescription>Applied to every deployment in this project.</CardDescription>
        <CardAction>
          <Button variant="secondary" size="sm">Edit</Button>
        </CardAction>
      </CardHeader>
      <CardBody>
        Failed jobs are retried up to 3 times with exponential backoff, starting at 30 seconds.
      </CardBody>
      <CardFooter>
        <Button variant="ghost" size="sm">Discard</Button>
        <Button size="sm">Save changes</Button>
      </CardFooter>
    </Card>
  );
}
