import { useState } from 'react';
import { MegaMenu } from '../MegaMenu';
import { megaMenuItems } from './items';

export default function MegaMenuBasic() {
  const [href, setHref] = useState('#deployments');
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-border bg-chrome px-2 py-1.5">
        <MegaMenu
          label="Product"
          items={megaMenuItems}
          currentHref={href}
          onNavigate={(link) => {
            if (link.href) setHref(link.href);
          }}
        />
      </div>
      <p className="text-[12px] text-muted-foreground">Current page: {href}</p>
    </div>
  );
}
