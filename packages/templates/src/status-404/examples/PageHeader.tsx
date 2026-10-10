import { PageHeader } from '@gntik-ai/blocks';
import { useEffect, useRef } from 'react';
import Status404Page from '../Page';

export default function Status404PageHeader() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { titleRef.current?.focus(); }, []);

  return (
    <Status404Page
      heading={
        <PageHeader
          as="div"
          title="Page not found"
          titleRef={titleRef}
          breadcrumbs={null}
          description={null}
          status=""
          meta={[]}
          tabs={null}
          actions={[]}
        />
      }
    />
  );
}
