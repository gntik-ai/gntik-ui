import { TooltipProvider } from '@gntik-ai/ui';
import { useState } from 'react';
import { MessageFeedback, type FeedbackValue } from '../MessageFeedback';

export default function MessageFeedbackReply() {
  const [feedback, setFeedback] = useState<FeedbackValue>({ rating: null });
  const [regenerated, setRegenerated] = useState(0);
  return (
    <TooltipProvider>
      <div className="flex max-w-xl flex-col gap-2">
        <p className="text-[14px] leading-[1.7] text-foreground">
          Eleven of the twelve deployments succeeded this week; one was rolled back after a failed health check.
        </p>
        <MessageFeedback
          value={feedback}
          onFeedback={setFeedback}
          copyText="Eleven of the twelve deployments succeeded this week; one was rolled back after a failed health check."
          onRegenerate={() => setRegenerated((n) => n + 1)}
        />
        <p className="font-mono text-[11px] text-muted-foreground">
          rating: {feedback.rating ?? 'none'}
          {feedback.reason ? ` · reason: ${feedback.reason}` : ''}
          {feedback.comment ? ` · comment: ${feedback.comment}` : ''}
          {regenerated ? ` · regenerated ${regenerated}×` : ''}
        </p>
      </div>
    </TooltipProvider>
  );
}
