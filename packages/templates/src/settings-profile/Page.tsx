import { FormSection, ProfileHeader, StickyActionBar, type Profile } from '@gntik-ai/blocks';
import { Field, FieldDescription, FieldLabel, Input, SimpleSelect, Stack } from '@gntik-ai/ui';
import { useState } from 'react';
import { locales as defaultLocales, profile as defaultProfile, profileValues, timeZones as defaultTimeZones, type ProfileFormValues, type SelectOption } from './data';
import { SettingsFrame, type SettingsFrameOptions } from './SettingsFrame';

export interface SettingsProfileProps extends SettingsFrameOptions {
  profile: Profile;
  /** Saved form values. */
  values: ProfileFormValues;
  locales: SelectOption[];
  timeZones: SelectOption[];
  /** Persists the form. A returned promise shows the saving state. */
  onSave: (values: ProfileFormValues) => void | Promise<void>;
  onAvatarChange: (file: File) => void;
}

/** Profile settings: ProfileHeader, personal and regional FormSections, StickyActionBar. */
export default function SettingsProfilePage({
  profile = defaultProfile,
  values: saved = profileValues,
  locales = defaultLocales,
  timeZones = defaultTimeZones,
  onSave,
  onAvatarChange,
  ...frame
}: Partial<SettingsProfileProps>) {
  const [base, setBase] = useState(saved);
  const [draft, setDraft] = useState(saved);
  const [saving, setSaving] = useState(false);
  const dirty = (Object.keys(draft) as Array<keyof ProfileFormValues>).some((k) => draft[k] !== base[k]);
  const set = (key: keyof ProfileFormValues) => (value: string | null) => setDraft((d) => ({ ...d, [key]: value ?? '' }));

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
    <SettingsFrame page="profile" description="How other members see you across the workspace." {...frame}>
      <ProfileHeader profile={{ ...profile, name: base.name }} headingLevel="h2" onEdit={null} onAvatarChange={onAvatarChange} />
      <Stack gap={8}>
        <FormSection title="Personal details" description="Your name and email are visible to everyone in the workspace." divided>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>Full name</FieldLabel>
              <Input value={draft.name} onValueChange={set('name')} autoComplete="name" />
            </Field>
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input type="email" value={draft.email} onValueChange={set('email')} autoComplete="email" />
              <FieldDescription>We send a confirmation link when it changes.</FieldDescription>
            </Field>
          </div>
        </FormSection>
        <FormSection title="Language and region" description="Used for dates, numbers and email digests." divided>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SimpleSelect label="Locale" items={locales} value={draft.locale} onValueChange={set('locale')} className="w-full" />
            <SimpleSelect label="Time zone" items={timeZones} value={draft.timeZone} onValueChange={set('timeZone')} className="w-full" />
          </div>
        </FormSection>
      </Stack>
      <StickyActionBar dirty={dirty} saving={saving} onSave={() => void save()} onCancel={() => setDraft(base)} aria-label="Profile changes" />
    </SettingsFrame>
  );
}
