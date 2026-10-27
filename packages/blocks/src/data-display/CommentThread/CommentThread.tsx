import { Avatar, Button, cn, Textarea, Timestamp, type DateInput, useI18n } from '@gntik-ai/ui';
import { useId, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import { COMMENT_AUTHOR, REVIEW_COMMENTS } from './fixtures';

export interface CommentAuthor {
  name: string;
  src?: string;
}

export interface ThreadComment {
  id: string;
  author: CommentAuthor;
  /** Plain text by default, with line breaks kept; pass renderBody to render Markdown. */
  body: string;
  at: DateInput;
}

export interface CommentThreadProps {
  comments?: readonly ThreadComment[];
  /**
   * Render the raw comment in a block container. Bodies are untrusted: use a safe
   * renderer such as Markdown from @gntik-ai/chat (without allowHtml), never raw HTML.
   * Defaults to plain text with line breaks kept.
   */
  renderBody?: (comment: ThreadComment) => ReactNode;
  /** Author of new comments (the signed-in user). */
  currentUser?: CommentAuthor;
  /** Called with the trimmed text when a comment is posted. */
  onSubmit?: (body: string) => void;
  /** Append posted comments locally (default). Turn off when the parent updates `comments`. */
  appendOnSubmit?: boolean;
  /** Accessible name of the thread. */
  label?: string;
  placeholder?: string;
  submitLabel?: string;
  /** Overrides the plain-text or Markdown hint; stays the composer's accessible description. */
  composerHint?: ReactNode;
  className?: string;
}

/** Comment thread: avatar, author, plain text (or Markdown via renderBody) and Timestamp, with a reply composer (⌘/Ctrl+Enter posts). */
export function CommentThread({
  comments = REVIEW_COMMENTS,
  renderBody,
  currentUser = COMMENT_AUTHOR,
  onSubmit,
  appendOnSubmit = true,
  label: labelProp,
  placeholder: placeholderProp,
  submitLabel: submitLabelProp,
  composerHint,
  className,
}: CommentThreadProps) {
  const { t } = useI18n();
  const label = labelProp ?? t('comments.label');
  const placeholder = placeholderProp ?? t('comments.placeholder');
  const submitLabel = submitLabelProp ?? t('comments.submit');
  const [draft, setDraft] = useState('');
  const [posted, setPosted] = useState<ThreadComment[]>([]);
  const hintId = useId();
  const all = appendOnSubmit ? [...comments, ...posted] : comments;
  const text = draft.trim();

  const post = () => {
    if (!text) return;
    onSubmit?.(text);
    if (appendOnSubmit)
      setPosted((prev) => [
        ...prev,
        { id: `local-${prev.length + 1}`, author: currentUser, body: text, at: Date.now() },
      ]);
    setDraft('');
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    post();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      post();
    }
  };

  return (
    <section aria-label={label} className={cn('flex flex-col gap-6', className)}>
      <ul aria-label={`${all.length} ${all.length === 1 ? 'comment' : 'comments'}`} className="flex flex-col gap-5">
        {all.map((comment, i) => (
          <li key={comment.id} className="relative flex gap-3">
            {i < all.length - 1 && (
              <span aria-hidden className="absolute top-9 -bottom-5 start-[15.5px] w-px bg-border" />
            )}
            <Avatar name={comment.author.name} src={comment.author.src} size="sm" className="relative z-raised" />
            <article className="min-w-0 flex-1 rounded-lg border border-border bg-background/50 p-3">
              <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <span className="text-[12.5px] font-semibold text-foreground">{comment.author.name}</span>
                <Timestamp value={comment.at} className="font-mono text-[11px]" />
              </header>
              {renderBody ? (
                <div className="mt-1 text-[13px] leading-relaxed text-foreground/85">{renderBody(comment)}</div>
              ) : (
                <p className="mt-1 text-[13px] leading-relaxed whitespace-pre-line text-foreground/85">
                  {comment.body}
                </p>
              )}
            </article>
          </li>
        ))}
      </ul>
      <form onSubmit={submit} className="flex gap-3">
        <Avatar name={currentUser.name} src={currentUser.src} size="sm" />
        <div className="min-w-0 flex-1 rounded-lg border border-border bg-background/50 transition-colors focus-within:border-primary/50">
          <Textarea
            aria-label={t('comments.write')}
            aria-describedby={hintId}
            value={draft}
            onValueChange={setDraft}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            rows={3}
            resize="none"
            className="border-0 bg-transparent shadow-none"
          />
          <div className="flex items-center justify-between gap-2 border-t border-border/60 px-3 py-2">
            <span id={hintId} className="text-[11.5px] text-muted-foreground">
              {composerHint ?? t(renderBody ? 'comments.hintMarkdown' : 'comments.hintPlain')}
            </span>
            <Button type="submit" size="sm" disabled={!text}>
              {submitLabel}
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}
