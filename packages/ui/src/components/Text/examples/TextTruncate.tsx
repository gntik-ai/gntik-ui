import { Heading, Text } from '../Text';

export default function TextTruncate() {
  return (
    <div className="grid max-w-[280px] gap-2 rounded-xl border border-border bg-card p-5">
      <Heading level={3} size="xs" truncate>Quarterly infrastructure review for the data pipeline team</Heading>
      <Text variant="supporting" lineClamp={2}>
        The pipeline processed 1.2 billion events this quarter with a median latency of 840 ms. Two incidents
        caused partial delays; both were resolved within the agreed response window.
      </Text>
    </div>
  );
}
