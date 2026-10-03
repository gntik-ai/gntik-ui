import { FolderKanban, Receipt, Users } from 'lucide-react';
import { ClickableCard } from '../ClickableCard';

export default function ClickableCardList() {
  return (
    <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-2">
      <ClickableCard
        href="/projects/atlas"
        icon={<FolderKanban aria-hidden />}
        title="Atlas"
        description="Customer-facing API and web app."
        meta={<span>8 members · updated 2 hours ago</span>}
      />
      <ClickableCard
        href="/settings/members"
        icon={<Users aria-hidden />}
        title="Members"
        description="Invite people and manage roles."
      />
      <ClickableCard
        onClick={() => {}}
        icon={<Receipt aria-hidden />}
        title="Download invoices"
        description="Export every invoice of this year as a ZIP."
        chevron={false}
      />
      <ClickableCard href="/archive" icon={<FolderKanban aria-hidden />} title="Archived projects" description="Available on the Business plan." disabled />
    </div>
  );
}
