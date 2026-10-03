import { Alert } from '../Alert';

export default function AlertTones() {
  return (
    <div className="grid max-w-2xl gap-3">
      <Alert tone="info" title="Scheduled maintenance">
        The control plane will be read-only on Sunday from 02:00 to 03:00 UTC.
      </Alert>
      <Alert tone="success" title="Deployment complete">
        <span className="font-mono">web-frontend</span> is now serving traffic in all regions.
      </Alert>
      <Alert tone="warning" title="Budget at 92%">
        This project has used $9.2k of its $10k monthly budget. Raise the limit or pause non-critical jobs.
      </Alert>
      <Alert tone="destructive" title="3 deployments failing">
        Health checks in <span className="font-mono">us-east-1</span> have failed for 4 minutes.
      </Alert>
    </div>
  );
}
