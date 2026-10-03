import { NotificationMatrix, StickyActionBar, type NotificationChannel, type NotificationEvent, type NotificationMatrixValue } from '@gntik-ai/blocks';
import { Section } from '@gntik-ai/ui';
import { useState } from 'react';
import { SettingsFrame, type SettingsFrameOptions } from '../settings-profile/SettingsFrame';
import { channels as defaultChannels, events as defaultEvents, preferences as defaultPreferences } from './data';

export interface SettingsNotificationsProps extends SettingsFrameOptions {
  channels: NotificationChannel[];
  events: NotificationEvent[];
  /** Saved preferences: event id → enabled channel ids. */
  value: NotificationMatrixValue;
  /** Persists the matrix. A returned promise shows the saving state. */
  onSave: (value: NotificationMatrixValue) => void | Promise<void>;
}

const key = (v: NotificationMatrixValue) =>
  JSON.stringify(
    Object.keys(v)
      .sort()
      .map((k) => [k, [...(v[k] ?? [])].sort()]),
  );

/** Notification settings: NotificationMatrix with a StickyActionBar. */
export default function SettingsNotificationsPage({
  channels = defaultChannels,
  events = defaultEvents,
  value: saved = defaultPreferences,
  onSave,
  ...frame
}: Partial<SettingsNotificationsProps>) {
  const [base, setBase] = useState(saved);
  const [draft, setDraft] = useState(saved);
  const [saving, setSaving] = useState(false);
  const dirty = key(draft) !== key(base);

  const save = async () => {
    setSaving(true);
    try {
      await onSave?.(draft);
      setBase(draft);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsFrame page="notifications" width="wide" description="Choose how you hear about what happens in your workspace." {...frame}>
      <Section title="Notification preferences" description="Security alerts always reach your email.">
        <NotificationMatrix channels={channels} events={events} value={draft} onValueChange={setDraft} />
      </Section>
      <StickyActionBar dirty={dirty} saving={saving} onSave={() => void save()} onCancel={() => setDraft(base)} aria-label="Notification changes" />
    </SettingsFrame>
  );
}
