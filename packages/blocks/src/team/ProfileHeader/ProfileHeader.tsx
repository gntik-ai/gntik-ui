import { Avatar, Badge, Button, IconButton, cn } from '@gntik-ai/ui';
import { Camera, Pencil } from '@gntik-ai/icons';
import { useRef, useState, type ReactNode } from 'react';
import { profile as defaultProfile, type Profile } from './fixtures';

export type { Profile, ProfileMetaItem } from './fixtures';

export interface ProfileHeaderProps {
  profile?: Profile;
  /** Called with the picked image; the avatar previews it right away. `null` hides the change action. */
  onAvatarChange?: ((file: File) => void) | null;
  /** Called by the Edit profile button. `null` hides it. */
  onEdit?: (() => void) | null;
  /** Extra actions next to Edit. */
  actions?: ReactNode;
  headingLevel?: 'h1' | 'h2';
  className?: string;
}

/** Profile header: large avatar with a change action, name, role, headline, meta row and edit button. */
export function ProfileHeader({
  profile = defaultProfile,
  onAvatarChange = () => {},
  onEdit = () => {},
  actions,
  headingLevel: Heading = 'h1',
  className,
}: ProfileHeaderProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const pick = (file: File) => {
    onAvatarChange?.(file);
    try {
      const url = URL.createObjectURL(file);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(url);
    } catch {
      // No object URLs (e.g. server or test environments): keep the current image.
    }
  };

  return (
    <div className={cn('flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6', className)}>
      <div className="relative w-fit shrink-0">
        <Avatar size="xl" name={profile.name} src={preview ?? profile.avatarUrl} />
        {onAvatarChange && (
          <>
            <IconButton
              icon={Camera}
              label="Change avatar"
              size="sm"
              variant="secondary"
              className="absolute -right-1 -bottom-1 rounded-full"
              onClick={() => fileRef.current?.click()}
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) pick(file);
                e.target.value = '';
              }}
            />
          </>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <Heading className="truncate text-[22px] font-semibold tracking-tight text-foreground">{profile.name}</Heading>
          {profile.role && (
            <Badge tone="primary" size="lg">
              {profile.role}
            </Badge>
          )}
        </div>
        {profile.headline && <p className="mt-1 text-[13.5px] text-muted-foreground">{profile.headline}</p>}
        {profile.meta && profile.meta.length > 0 && (
          <ul aria-label="Details" className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
            {profile.meta.map(({ icon: MetaIcon, label }) => (
              <li key={label} className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
                {MetaIcon && <MetaIcon size={14} aria-hidden />}
                {label}
              </li>
            ))}
          </ul>
        )}
      </div>
      {(onEdit || actions) && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
          {onEdit && (
            <Button variant="secondary" icon={Pencil} onClick={onEdit}>
              Edit profile
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
