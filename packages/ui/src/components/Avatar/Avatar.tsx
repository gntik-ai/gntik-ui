import { Avatar as BaseAvatar } from '@base-ui/react/avatar';
import { Children, createContext, isValidElement, useContext, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { cn } from '../../utils/cn';
import { avatarVariants, type AvatarSize, type AvatarStatus, type AvatarVariantProps } from './avatar.variants';

const AvatarGroupContext = createContext<{ size?: AvatarSize; ring: boolean } | null>(null);

const STATUS_LABEL: Record<AvatarStatus, string> = { online: 'online', idle: 'idle', busy: 'busy', offline: 'offline' };

/** First letters of the first two words, upper-cased ("Maria Ruiz" → "MR"). */
export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join('');
}

export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'className'>, Omit<AvatarVariantProps, 'ring'> {
  className?: string;
  ref?: Ref<HTMLSpanElement>;
  /** Image URL. While it loads, or if it fails, the initials show instead. */
  src?: string;
  /** Person or entity name: the accessible name and the source of the initials. */
  name?: string;
  /** Overrides the initials derived from `name`. */
  initials?: string;
  /** Replaces the initials (e.g. an icon for a bot or service account). */
  fallback?: ReactNode;
  /** Presence dot in the corner; also announced in the accessible name. */
  status?: AvatarStatus;
  /** Overrides the announced status text (e.g. for localisation). */
  statusLabel?: string;
}

/**
 * Image avatar with an initials fallback, built on Base UI Avatar. Exposed as one image
 * (role="img") named after `name` and its status; without a name it is decorative.
 */
export function Avatar({
  src,
  name,
  initials,
  fallback,
  size,
  shape,
  tone,
  status,
  statusLabel,
  className,
  ...props
}: AvatarProps) {
  const group = useContext(AvatarGroupContext);
  const s = avatarVariants({ size: size ?? group?.size, shape, tone, status, ring: group?.ring });
  const statusText = status ? (statusLabel ?? STATUS_LABEL[status]) : undefined;
  const label = name ? (statusText ? `${name} (${statusText})` : name) : undefined;
  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(s.wrapper(), className)}
      {...props}
    >
      <BaseAvatar.Root className={s.root()}>
        <BaseAvatar.Fallback className={s.fallback()}>{fallback ?? initials ?? (name ? getInitials(name) : null)}</BaseAvatar.Fallback>
        {src && <BaseAvatar.Image src={src} alt="" className={s.image()} />}
      </BaseAvatar.Root>
      {status && <span className={s.status()} data-status={status} />}
    </span>
  );
}

export interface AvatarGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  className?: string;
  ref?: Ref<HTMLDivElement>;
  /** Size applied to every child avatar and the overflow chip. */
  size?: AvatarSize;
  /** Max avatars shown; the rest collapse into a "+N" chip. */
  max?: number;
  /** Accessible name of the group (e.g. "Project members"). */
  label?: string;
  children?: ReactNode;
}

/** Overlapping stack of avatars with a "+N more" overflow chip. */
export function AvatarGroup({ size = 'md', max, label, className, children, ...props }: AvatarGroupProps) {
  const { t } = useI18n();
  const items = Children.toArray(children).filter(isValidElement);
  const shown = max !== undefined ? items.slice(0, max) : items;
  const extra = items.length - shown.length;
  const s = avatarVariants({ size });
  return (
    <AvatarGroupContext value={{ size, ring: true }}>
      <div role="group" aria-label={label} className={cn('flex items-center -space-x-2.5', className)} {...props}>
        {shown}
        {extra > 0 && (
          <span className={s.overflow()}>
            +{extra}
            <span className="sr-only"> {t('avatar.more')}</span>
          </span>
        )}
      </div>
    </AvatarGroupContext>
  );
}
