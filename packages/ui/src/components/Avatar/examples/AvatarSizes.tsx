import { Bot } from 'lucide-react';
import { Avatar } from '../Avatar';

export default function AvatarSizes() {
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end gap-5">
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
          <Avatar key={size} size={size} name="Maria Ruiz" />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Avatar name="Jordan Lee" tone="accent" shape="rounded" />
        <Avatar name="Sam King" tone="violet" />
        <Avatar name="Ana Torres" tone="rose" />
        <Avatar name="Dev Nair" tone="cyan" />
        <Avatar name="Val Gomez" tone="amber" />
        <Avatar name="Build service" tone="secondary" shape="rounded" fallback={<Bot size={20} aria-hidden />} />
        <Avatar name="Priya Shah" src="/avatars/priya.png" />
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <Avatar size="lg" name="Maria Ruiz" status="online" />
        <Avatar size="lg" name="Jordan Lee" tone="violet" status="idle" />
        <Avatar size="lg" name="Sam King" tone="cyan" status="busy" />
        <Avatar size="lg" name="Val Gomez" tone="secondary" status="offline" />
      </div>
    </div>
  );
}
