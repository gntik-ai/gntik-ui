import { DescriptionListCard, ProfileHeader, SectionHeader, type Profile } from '@gntik-ai/blocks';
import { Badge, EmptyState, Stack } from '@gntik-ai/ui';
import { useId, type ReactNode } from 'react';
import { profile as defaultProfile, profileValues } from './data';
import { SettingsFrame, type SettingsFrameOptions } from './SettingsFrame';

export interface ReadOnlyProfileOptions {
  /** Label/value identity rows, displayed only in read-only mode. */
  identity?: readonly ProfileDetail[];
  /** Optional active-context rows; omitted means no context section. */
  context?: readonly ProfileDetail[];
  /** Text used for missing identity or context values. Defaults to 'Not selected'. */
  contextFallback?: string;
  /** Ordered role labels; omitted means no roles section. */
  roles?: readonly string[];
  /** Empty roles copy. Defaults to 'No roles assigned'. */
  emptyRolesMessage?: string;
}

export interface ProfileDetail {
  id: string;
  label: string;
  value?: ReactNode;
  mono?: boolean;
}

export function ReadOnlyProfile({
  profile = defaultProfile,
  identity = [
    { id: 'name', label: 'Full name', value: profile.name },
    { id: 'email', label: 'Email', value: profileValues.email },
  ],
  context,
  contextFallback = 'Not selected',
  roles,
  emptyRolesMessage = 'No roles assigned',
  basePath,
  onNavigate,
  extraNavItems,
  shell,
}: ReadOnlyProfileOptions & SettingsFrameOptions & { profile?: Profile }) {
  const rolesHeading = useId();
  const details = (items: readonly ProfileDetail[]) =>
    items.map(({ id, label, value, mono }) => ({
      id,
      label,
      mono,
      render: value == null || value === '' ? contextFallback : value,
    }));
  return (
    <SettingsFrame
      page="profile"
      description="Your identity and active context."
      basePath={basePath}
      onNavigate={onNavigate}
      extraNavItems={extraNavItems}
      shell={shell}
      saveBar="none"
    >
      <ProfileHeader profile={profile} headingLevel="h2" onAvatarChange={null} onEdit={null} />
      <Stack gap={8}>
        <DescriptionListCard title="Identity" titleAs="h2" description="" items={details(identity)} />
        {context !== undefined && (
          <DescriptionListCard title="Active context" titleAs="h2" description="" items={details(context)} />
        )}
        {roles !== undefined && (
          <section aria-labelledby={rolesHeading} className="flex flex-col gap-4">
            <SectionHeader title="Roles" description={null} actions={[]} headingId={rolesHeading} />
            {roles.length === 0 ? (
              <EmptyState title={emptyRolesMessage} titleAs="h3" size="sm" />
            ) : (
              <ul className="flex flex-wrap gap-2">
                {roles.map((role, index) => (
                  <li key={`${index}-${role}`}>
                    <Badge>{role}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </Stack>
    </SettingsFrame>
  );
}
