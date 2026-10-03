import { Blockquote } from '../Blockquote';

export default function BlockquoteProse() {
  return (
    <div className="max-w-xl space-y-3 text-[13.5px] leading-6 text-muted-foreground">
      <p>The postmortem closed with one recommendation for every team that runs scheduled deployments:</p>
      <Blockquote source="Incident review" sourceDetail="Platform reliability, Q3" cite="https://example.com/reviews/q3">
        Treat the rollback path as a feature. If it has never run in production, it does not exist.
      </Blockquote>
    </div>
  );
}
