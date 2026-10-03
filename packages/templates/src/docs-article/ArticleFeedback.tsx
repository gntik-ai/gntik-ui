import { ThumbsDown, ThumbsUp } from '@gntik-ai/icons';
import { Button, Field, FieldLabel, HStack, Stack, Text, Textarea } from '@gntik-ai/ui';
import { useId, useState } from 'react';

export interface ArticleFeedbackValue {
  helpful: boolean;
  comment?: string;
}

export interface ArticleFeedbackProps {
  onFeedback?: (value: ArticleFeedbackValue) => void;
}

/** "Was this helpful?" with Yes / No; No asks what was missing. Status changes are announced. */
export function ArticleFeedback({ onFeedback }: ArticleFeedbackProps) {
  const [answer, setAnswer] = useState<'yes' | 'no' | 'sent' | null>(null);
  const [comment, setComment] = useState('');
  const id = useId();

  const answerYes = () => {
    setAnswer('sent');
    onFeedback?.({ helpful: true });
  };
  const send = () => {
    setAnswer('sent');
    onFeedback?.({ helpful: false, comment: comment.trim() || undefined });
  };

  return (
    <section aria-labelledby={`${id}-title`} className="rounded-xl border border-border bg-card p-4">
      <h2 id={`${id}-title`} className="text-[14px] font-semibold text-foreground">
        Was this helpful?
      </h2>
      <div aria-live="polite">
        {answer === 'sent' ? (
          <Text variant="supporting" tone="muted" className="mt-1">
            Thanks for your feedback.
          </Text>
        ) : answer === 'no' ? (
          <form
            className="mt-3"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <Stack gap={3}>
              <Field>
                <FieldLabel>What was missing?</FieldLabel>
                <Textarea rows={3} value={comment} onValueChange={setComment} placeholder="Optional" />
              </Field>
              <HStack gap={2}>
                <Button type="submit" size="sm">
                  Send feedback
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setAnswer(null)}>
                  Cancel
                </Button>
              </HStack>
            </Stack>
          </form>
        ) : (
          <HStack gap={2} className="mt-3">
            <Button variant="secondary" size="sm" icon={ThumbsUp} onClick={answerYes}>
              Yes
            </Button>
            <Button variant="secondary" size="sm" icon={ThumbsDown} onClick={() => setAnswer('no')}>
              No
            </Button>
          </HStack>
        )}
      </div>
    </section>
  );
}
