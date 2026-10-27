import { useI18n } from '@gntik-ai/ui';
import { CommentThread } from '../CommentThread';

/**
 * /preview.html?kind=block&id=comment-thread--rendered-body
 * A text-only stub demonstrates renderBody and a ReactNode composerHint override.
 * For safe Markdown, see the scorecard template's @gntik-ai/chat Markdown renderer
 * (without allowHtml). Treat bodies as untrusted; never inject raw HTML.
 */
export default function RenderedBody() {
  const { t } = useI18n();
  return (
    <CommentThread
      renderBody={(comment) => (
        <blockquote className="border-s-2 border-border ps-3 whitespace-pre-line">{comment.body}</blockquote>
      )}
      composerHint={<span>{t('comments.hintPlain')}</span>}
    />
  );
}
