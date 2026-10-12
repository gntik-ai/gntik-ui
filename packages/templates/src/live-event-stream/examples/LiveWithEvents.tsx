import LiveEventStreamPage from '../Page';
import { streamEvents } from '../data';

export default function LiveWithEvents() {
  return <LiveEventStreamPage status="live" events={streamEvents} />;
}
