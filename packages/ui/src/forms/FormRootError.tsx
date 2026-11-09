import { Alert, type AlertProps } from '../components/Alert';
import { useServerRootMessage } from './serverErrors';

export type FormRootErrorProps = Omit<AlertProps, 'tone' | 'title' | 'description' | 'children'>;

/**
 * The form-level server error: the `errors` entry under the key `''`, or one whose path matches no
 * mounted FormField. A destructive Alert with role="alert"; renders nothing while empty, and the
 * next submit removes it.
 */
export function FormRootError(props: FormRootErrorProps) {
  const message = useServerRootMessage();
  if (!message) return null;
  return (
    <Alert {...props} tone="destructive">
      {message}
    </Alert>
  );
}
