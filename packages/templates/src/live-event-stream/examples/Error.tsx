import LiveEventStreamPage from '../Page';

export default function ErrorExample() {
  return <LiveEventStreamPage status="error" error="The event source is unavailable. Try subscribing again." />;
}
