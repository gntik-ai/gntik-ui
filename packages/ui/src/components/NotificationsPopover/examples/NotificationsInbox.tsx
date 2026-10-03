import { useState } from 'react';
import { Link } from '../../Link';
import { NotificationsPopover, type NotificationItem } from '../NotificationsPopover';

const MIN = 60_000;
const NOW = Date.now();

const INITIAL: NotificationItem[] = [
  { id: 'n1', tone: 'warning', title: 'api-gateway reached 97% of its monthly budget', body: 'Requests are throttled to 1/min until the limit is raised.', time: NOW - 2 * MIN },
  { id: 'n2', tone: 'primary', title: 'Deployment web-frontend (build 418) succeeded', body: 'Promoted to production by Dana Whitfield.', time: NOW - 18 * MIN },
  { id: 'n3', tone: 'info', title: 'Sam Patel invited you to Data Platform', time: NOW - 65 * MIN },
  { id: 'n4', tone: 'destructive', title: 'Invoice INV-2041 payment failed', body: 'Update the card on file to avoid interruption.', time: NOW - 26 * 60 * MIN, read: true },
];

export default function NotificationsInbox() {
  const [items, setItems] = useState(INITIAL);
  const markRead = (id: string) => setItems((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
  return (
    <NotificationsPopover
      notifications={items}
      onSelect={(n) => markRead(n.id)}
      onMarkAllRead={() => setItems((list) => list.map((n) => ({ ...n, read: true })))}
      footer={
        <Link href="#notifications" className="flex h-8 items-center justify-center text-[12.5px]">
          View all notifications
        </Link>
      }
    />
  );
}
