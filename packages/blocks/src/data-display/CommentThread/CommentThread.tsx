import { Avatar, Button, cn, Textarea, Timestamp, type DateInput } from '@gntik-ai/ui';
import { useId, useState, type FormEvent, type KeyboardEvent } from 'react';
import { COMMENT_AUTHOR, REVIEW_COMMENTS } from './fixtures';

export interface CommentAuthor {
  name: string;
  src?: string;
}

export interface ThreadComment {
  id: string;
  author: CommentAuthor;
  /** Plain text (no markdown); line breaks are kept. */
  body: string;
  at: DateInput;
}

export interface CommentThreadProps {
  comments?: readonly ThreadComment[];
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
  className?: string;
}

/** Comment thread: avatar, author, plain-text body and Timestamp, with a reply composer (⌘/Ctrl+Enter posts). */
export function CommentThread({
  comments = REVIEW_COMMENTS,
  currentUser = COMMENT_AUTHOR,
  onSubmit,
  appendOnSubmit = true,
  label = 'Comments',
  placeholder = 'Add a comment…',
  submitLabel = 'Comment',
  className,
}: CommentThreadProps) {
  const [draft, setDraft] = useState('');
  const [posted, setPosted] = useState<ThreadComment[]>([]);
  const hintId = useId();
  const all = appendOnSubmit ? [...comments, ...posted] : comments;
  const text = draft.trim();

  const post = () => {
    if (!text) return;
    onSubmit?.(text);
    if (appendOnSubmit) setPosted((prev) => [...prev, { id: `local-${prev.length + 1}`, author: currentUser, body: text, at: Date.now() }]);
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
            {i < all.length - 1 && <span aria-hidden className="absolute top-9 -bottom-5 left-[15.5px] w-px bg-border" />}
            <Avatar name={comment.author.name} src={comment.author.src} size="sm" className="relative z-10" />
            <article className="min-w-0 flex-1 rounded-lg border border-border bg-background/50 p-3">
              <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <span className="text-[12.5px] font-semibold text-foreground">{comment.author.name}</span>
                <Timestamp value={comment.at} className="font-mono text-[11px]" />
              </header>
              <p className="mt-1 text-[13px] leading-relaxed whitespace-pre-line text-foreground/85">{comment.body}</p>
            </article>
          </li>
        ))}
      </ul>
      <form onSubmit={submit} className="flex gap-3">
        <Avatar name={currentUser.name} src={currentUser.src} size="sm" />
        <div className="min-w-0 flex-1 rounded-lg border border-border bg-background/50 transition-colors focus-within:border-primary/50">
          <Textarea
            aria-label="Write a comment"
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
              Plain text · ⌘/Ctrl + Enter to post
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
