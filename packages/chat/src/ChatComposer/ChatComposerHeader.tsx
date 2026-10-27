import { IconButton } from '@gntik-ai/ui';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useChatI18n } from '../utils/i18n';
import { chatComposerStyles as s } from './chatComposer.variants';

export interface ChatComposerHeaderProps {
  title: ReactNode;
  onClose?: () => void;
  children?: ReactNode;
}

/** Optional composer header for a quoted reply or contextual content. */
export function ChatComposerHeader({ title, onClose, children }: ChatComposerHeaderProps) {
  const { t, tc } = useChatI18n();
  return (
    <div className={s.header}>
      <div className={s.headerRow}>
        <div className="min-w-0 flex-1">{title}</div>
        {onClose && (
          <IconButton
            icon={X}
            size="sm"
            label={typeof title === 'string' ? tc('chat.closeHeader', { title }) : t('common.close')}
            onClick={onClose}
          />
        )}
      </div>
      {children != null && <div className={s.headerContent}>{children}</div>}
    </div>
  );
}
