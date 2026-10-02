import { Button } from '../../Button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../AlertDialog';

export default function AlertDialogTones() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <AlertDialog>
        <AlertDialogTrigger render={<Button variant="secondary" />}>Downgrade plan</AlertDialogTrigger>
        <AlertDialogContent size="md">
          <AlertDialogHeader tone="warning">
            <AlertDialogTitle>Downgrade to the Starter plan?</AlertDialogTitle>
            <AlertDialogDescription>
              Billing changes at the end of the cycle. Members above the Starter limit lose access until you upgrade again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep current plan</AlertDialogCancel>
            <AlertDialogAction variant="primary">Downgrade</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog>
        <AlertDialogTrigger render={<Button variant="secondary" />}>Transfer ownership</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader tone="info">
            <AlertDialogTitle>Transfer ownership?</AlertDialogTitle>
            <AlertDialogDescription>The new owner can manage billing and remove members. You stay on as an admin.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="primary">Transfer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
