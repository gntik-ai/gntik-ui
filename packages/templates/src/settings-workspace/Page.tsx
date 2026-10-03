import { DangerZone, FileUploadPanel, FormSection, StickyActionBar, type DangerZoneAction } from '@gntik-ai/blocks';
import { Field, FieldDescription, FieldError, FieldLabel, Input, SimpleSelect, Stack } from '@gntik-ai/ui';
import { useState } from 'react';
import { SettingsFrame, type SettingsFrameOptions } from '../settings-profile/SettingsFrame';
import { SLUG_RE, regions as defaultRegions, workspaceDangerActions, workspaceValues, type RegionOption, type WorkspaceValues } from './data';

export interface SettingsWorkspaceProps extends SettingsFrameOptions {
  values: WorkspaceValues;
  regions: RegionOption[];
  /** URL prefix shown before the slug. */
  urlPrefix: string;
  /** Danger zone rows; defaults to transfer and delete (typing the slug). */
  dangerActions: DangerZoneAction[];
  onSave: (values: WorkspaceValues) => void | Promise<void>;
  /** Uploads the logo; defaults to a demo upload. */
  onLogoUpload: (file: File, onProgress: (pct: number) => void) => Promise<void>;
  onDangerAction: (actionId: string) => void | Promise<void>;
}

/** Workspace settings: general FormSection (name, slug, region), logo FileUploadPanel, DangerZone. */
export default function SettingsWorkspacePage({
  values: saved = workspaceValues,
  regions = defaultRegions,
  urlPrefix = 'app.example.com/',
  dangerActions,
  onSave,
  onLogoUpload,
  onDangerAction,
  ...frame
}: Partial<SettingsWorkspaceProps>) {
  const [base, setBase] = useState(saved);
  const [draft, setDraft] = useState(saved);
  const [saving, setSaving] = useState(false);
  const dirty = draft.name !== base.name || draft.slug !== base.slug || draft.region !== base.region;
  const slugInvalid = !SLUG_RE.test(draft.slug);
  const set = (key: keyof WorkspaceValues) => (value: string | null) => setDraft((d) => ({ ...d, [key]: value ?? '' }));

  const save = async () => {
    if (slugInvalid) return;
    setSaving(true);
    try {
      await onSave?.(draft);
      setBase(draft);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsFrame page="workspace" description="Details every member sees, and where your data is stored." {...frame}>
      <Stack gap={8}>
        <FormSection title="General" description="The name and URL of this workspace.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>Workspace name</FieldLabel>
              <Input value={draft.name} onValueChange={set('name')} />
            </Field>
            <Field invalid={slugInvalid}>
              <FieldLabel>URL slug</FieldLabel>
              <Input value={draft.slug} onValueChange={set('slug')} leadingAddon={urlPrefix} inputClassName="font-mono" />
              <FieldDescription>Lowercase letters, numbers and dashes.</FieldDescription>
              <FieldError match={slugInvalid}>Use lowercase letters, numbers and single dashes.</FieldError>
            </Field>
          </div>
        </FormSection>
        <FormSection title="Logo" description="Shown in the sidebar and in emails. Square PNG or SVG, at least 256 px." divided>
          <FileUploadPanel label="Workspace logo" accept=".png,.svg,.jpg" maxSize={2 * 1024 * 1024} multiple={false} defaultFiles={[]} onUpload={onLogoUpload} />
        </FormSection>
        <FormSection title="Data region" description="Where projects, logs and backups are stored. Moving regions is done by support." divided>
          <SimpleSelect label="Region" items={regions} value={draft.region} onValueChange={set('region')} className="w-full sm:w-80" />
        </FormSection>
      </Stack>
      <DangerZone
        description="These actions affect the whole workspace and every member in it."
        actions={dangerActions ?? workspaceDangerActions(base.slug)}
        onConfirm={onDangerAction}
      />
      <StickyActionBar dirty={dirty} saving={saving} onSave={() => void save()} onCancel={() => setDraft(base)} aria-label="Workspace changes" />
    </SettingsFrame>
  );
}
