import { ChatComposer } from '../../ChatComposer';
import { ChatMessage } from '../../ChatMessage';
import { ChatLayout } from '../ChatLayout';

export default function ChatLayoutWithPanel() {
  return (
    <div className="h-[480px] overflow-hidden rounded-xl border border-border">
      <ChatLayout
        header={<div className="px-4 py-3 text-[13px] font-semibold">Quarterly usage review</div>}
        panel={
          <div className="p-4 text-[13px]">
            <h2 className="font-semibold text-foreground">Details</h2>
            <p className="mt-1 text-muted-foreground">Project web-app · 3 members · 12 deployments this week.</p>
          </div>
        }
        composer={<ChatComposer onSubmit={() => {}} hint={null} />}
      >
        <ChatMessage role="user" timestamp="10:02">
          Which project used the most build minutes this quarter?
        </ChatMessage>
        <ChatMessage role="assistant" timestamp="10:02" copyText="web-app used 1,240 build minutes, 46% of the total.">
          web-app used 1,240 build minutes, 46% of the total.
        </ChatMessage>
      </ChatLayout>
    </div>
  );
}
