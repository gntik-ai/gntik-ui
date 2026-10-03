import { Button, useI18n } from '@gntik-ai/ui';
import { Check, Copy } from 'lucide-react';
import { useCopy } from '../utils/useCopy';
import { markdownStyles } from './markdown.variants';

const s = markdownStyles.code;

export interface CodeBlockProps {
  /** Source text. */
  code: string;
  /** Language tag from the fence (```ts). */
  language?: string;
  className?: string;
}

/** Fenced code with a language label and a copy button. */
export function CodeBlock({ code, language, className }: CodeBlockProps) {
  const { copied, copy } = useCopy();
  const { t } = useI18n();
  return (
    <div className={className ? `${s.root} ${className}` : s.root} data-language={language}>
      <div className={s.header}>
        <span className={s.lang}>{language || 'text'}</span>
        <Button
          size="sm"
          variant="ghost"
          icon={copied ? Check : Copy}
          aria-label={copied ? t('chat.copiedCode') : t('chat.copyCode')}
          className="h-7 px-2"
          onClick={() => void copy(code)}
        >
          {copied ? t('common.copied') : t('common.copy')}
        </Button>
      </div>
      <pre className={s.pre}>
        <code>{code}</code>
      </pre>
    </div>
  );
}
