import LiveEventStreamPage from '../Page';
import { streamEvents } from '../data';

export default function Stopped() {
  return <LiveEventStreamPage status="stopped" events={streamEvents} />;
}
