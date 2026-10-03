import { Avatar } from '../../Avatar';
import { StatusDot } from '../../StatusDot';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../HoverCard';

export default function HoverCardMember() {
  return (
    <p className="text-[13px] text-muted-foreground">
      Last deployed by{' '}
      <HoverCard>
        <HoverCardTrigger href="/members/maria-ruiz">Maria Ruiz</HoverCardTrigger>
        <HoverCardContent arrow>
          <div className="flex items-start gap-3">
            <Avatar name="Maria Ruiz" size="md" />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-foreground">Maria Ruiz</p>
              <p className="text-[12px] text-muted-foreground">Staff engineer · Platform team</p>
              <StatusDot tone="success" size="sm" label="Online" className="mt-2" />
            </div>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3 text-[12px]">
            <div>
              <dt className="text-muted-foreground">Projects</dt>
              <dd className="font-semibold text-foreground">12</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Deployments this week</dt>
              <dd className="font-semibold text-foreground">34</dd>
            </div>
          </dl>
        </HoverCardContent>
      </HoverCard>{' '}
      3 minutes ago.
    </p>
  );
}
