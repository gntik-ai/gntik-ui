import { Rocket } from 'lucide-react';
import { Button } from '../../Button';
import { ToastProvider, Toaster, useToast } from '../Toast';

/** Stands in for a real request: resolves (or rejects) after a short delay. */
const deploy = (fail: boolean) =>
  new Promise<{ version: string }>((resolve, reject) =>
    setTimeout(() => (fail ? reject(new Error('Health check timed out')) : resolve({ version: 'v42' })), 1200),
  );

function DeployButtons() {
  const toast = useToast();
  const run = (fail: boolean) =>
    toast
      .promise(deploy(fail), {
        loading: { title: 'Deploying…', description: 'Building and rolling out the new version.' },
        success: (r) => ({ title: `Deployed ${r.version}`, description: 'All regions are serving the new version.' }),
        error: (e) => ({
          title: 'Deployment failed',
          description: e instanceof Error ? e.message : 'Unknown error',
          action: { label: 'Retry', onClick: () => void run(false) },
        }),
      })
      .catch(() => {});
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Button variant="secondary" size="sm" icon={Rocket} onClick={() => run(false)}>
        Deploy
      </Button>
      <Button variant="secondary" size="sm" onClick={() => run(true)}>
        Deploy (fails)
      </Button>
    </div>
  );
}

export default function ToastPromise() {
  return (
    <ToastProvider>
      <DeployButtons />
      <Toaster />
    </ToastProvider>
  );
}
