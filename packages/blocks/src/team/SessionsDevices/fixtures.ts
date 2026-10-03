const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

export type DeviceKind = 'desktop' | 'mobile' | 'tablet';

export interface DeviceSession {
  id: string;
  /** Device name, e.g. "MacBook Pro". */
  device: string;
  /** Browser or client, e.g. "Chrome 128 on macOS". */
  client: string;
  kind: DeviceKind;
  location: string;
  ip?: string;
  /** ISO date of the last request. */
  lastSeen: string;
  /** The session making this request. */
  current?: boolean;
}

export const deviceSessions: DeviceSession[] = [
  { id: 's1', device: 'MacBook Pro', client: 'Chrome 128 on macOS', kind: 'desktop', location: 'Lisbon, Portugal', ip: '192.0.2.14', lastSeen: ago(0), current: true },
  { id: 's2', device: 'Pixel 8', client: 'Mobile app 4.2', kind: 'mobile', location: 'Lisbon, Portugal', ip: '198.51.100.7', lastSeen: ago(42) },
  { id: 's3', device: 'iPad Air', client: 'Safari 17 on iPadOS', kind: 'tablet', location: 'Madrid, Spain', ip: '203.0.113.88', lastSeen: ago(60 * 30) },
  { id: 's4', device: 'Workstation', client: 'Firefox 130 on Linux', kind: 'desktop', location: 'Berlin, Germany', ip: '203.0.113.5', lastSeen: ago(60 * 24 * 12) },
];
