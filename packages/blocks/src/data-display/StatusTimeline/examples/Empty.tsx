import { StatusTimeline } from '../StatusTimeline';

/** /preview.html?kind=block&id=status-timeline--empty */
export default function Empty() {
  return <StatusTimeline events={[]} emptyLabel="No status changes yet" />;
}
