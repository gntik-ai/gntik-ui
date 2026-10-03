import { Eye, EyeOff, Lock, Search, Zap } from 'lucide-react';
import { useState } from 'react';
import { IconButton } from '../../Button';
import { Input, InputKbd } from '../Input';

export default function InputAddons() {
  const [show, setShow] = useState(false);
  return (
    <div className="grid max-w-3xl grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
      <Input leadingIcon={Search} placeholder="Search projects…" aria-label="Search projects" />
      <Input leadingIcon={Zap} trailingAddon={<InputKbd>⌘K</InputKbd>} placeholder="Go to…" aria-label="Go to" />
      <Input leadingAddon="app.example.com/" defaultValue="billing" aria-label="Workspace URL" />
      <Input trailingAddon="req/s" defaultValue="2000" inputMode="numeric" aria-label="Rate limit" />
      <Input
        className="pe-1.5 sm:col-span-2"
        leadingIcon={Lock}
        type={show ? 'text' : 'password'}
        defaultValue="sk-live-example-token"
        aria-label="API token"
        trailingAddon={
          <IconButton
            size="sm"
            className="size-7"
            icon={show ? EyeOff : Eye}
            label={show ? 'Hide token' : 'Show token'}
            onClick={() => setShow((v) => !v)}
          />
        }
      />
    </div>
  );
}
