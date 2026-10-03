import { Bell, CreditCard, KeyRound, User, Users } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../../components/Button';
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from '../../../components/Card';
import { Field, FieldDescription, FieldLabel } from '../../../components/Field';
import { Input } from '../../../components/Input';
import type { NavGroup } from '../../../components/NavList';
import { Switch } from '../../../components/Switch';
import { SettingsLayout } from '../SettingsLayout';

const GROUPS: NavGroup[] = [
  {
    label: 'Account',
    items: [
      { id: 'profile', label: 'Profile', icon: User },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'security', label: 'Security', icon: KeyRound },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { id: 'members', label: 'Members', icon: Users, badge: 12 },
      { id: 'billing', label: 'Billing', icon: CreditCard },
    ],
  },
];

const TITLES: Record<string, [string, string]> = {
  profile: ['Profile', 'How other members see you across the workspace.'],
  notifications: ['Notifications', 'Choose what we email you about.'],
  security: ['Security', 'Sign-in methods and active sessions.'],
  members: ['Members', 'Invite people and manage their roles.'],
  billing: ['Billing', 'Plan, payment method and invoices.'],
};

export default function SettingsLayoutWorkspace() {
  const [section, setSection] = useState('profile');
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [title, description] = TITLES[section] ?? ['Settings', ''];
  const edit = () => {
    setDirty(true);
    setSaved(false);
  };
  return (
    <div className="h-[520px] overflow-hidden rounded-lg border border-border">
      <SettingsLayout
        groups={GROUPS}
        value={section}
        onValueChange={setSection}
        title={title}
        description={description}
        saveBar={
          <>
            <p aria-live="polite" className="mr-auto text-[12.5px] text-muted-foreground">
              {dirty ? 'You have unsaved changes' : saved ? 'All changes saved' : ''}
            </p>
            <Button variant="ghost" size="sm" disabled={!dirty} onClick={() => setDirty(false)}>
              Discard
            </Button>
            <Button
              size="sm"
              disabled={!dirty}
              onClick={() => {
                setDirty(false);
                setSaved(true);
              }}
            >
              Save changes
            </Button>
          </>
        }
      >
        {section === 'notifications' ? (
          <Card>
            <CardHeader divided>
              <CardTitle as="h2">Email</CardTitle>
              <CardDescription>Sent to the address on your profile.</CardDescription>
            </CardHeader>
            <CardBody className="grid gap-4">
              <Switch label="Deployment failures" defaultChecked onCheckedChange={edit} />
              <Switch label="Weekly usage digest" onCheckedChange={edit} />
              <Switch label="New member requests" defaultChecked onCheckedChange={edit} />
            </CardBody>
          </Card>
        ) : (
          <Card>
            <CardHeader divided>
              <CardTitle as="h2">Personal details</CardTitle>
              <CardDescription>Your name and email are visible to workspace members.</CardDescription>
            </CardHeader>
            <CardBody className="grid gap-5 sm:grid-cols-2">
              <Field>
                <FieldLabel>Full name</FieldLabel>
                <Input defaultValue="Alex Morgan" onValueChange={edit} />
              </Field>
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input type="email" defaultValue="alex@example.com" onValueChange={edit} />
                <FieldDescription>We send a confirmation link when it changes.</FieldDescription>
              </Field>
            </CardBody>
          </Card>
        )}
      </SettingsLayout>
    </div>
  );
}
