'use client';
import { SettingsProfilePage } from '@gntik-ai/templates';
import { shellFor } from '../../../../data/console';
import { profile, profileValues } from '../../../../data/team';

export function ProfileView() {
  return (
    <SettingsProfilePage
      basePath="/settings"
      profile={profile}
      values={profileValues}
      onSave={() => new Promise<void>((resolve) => setTimeout(resolve, 600))}
      shell={shellFor('/settings/profile')}
    />
  );
}
