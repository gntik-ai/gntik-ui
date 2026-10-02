import { useState } from 'react';
import { Switch } from '../Switch';

export default function SwitchSettings() {
  const [alerts, setAlerts] = useState(true);
  return (
    <div className="grid gap-4">
      <Switch label="Email alerts" checked={alerts} onCheckedChange={setAlerts} />
      <Switch label="Weekly digest" size="sm" />
      <Switch label="Auto-deploy" size="lg" defaultChecked />
      <Switch label="Audit log (locked)" disabled defaultChecked />
    </div>
  );
}
