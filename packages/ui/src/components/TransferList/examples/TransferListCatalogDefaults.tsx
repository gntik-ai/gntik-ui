import { useState } from 'react';
import { I18nProvider } from '../../../i18n/I18nProvider';
import { BottomSheet, BottomSheetContent, BottomSheetTrigger } from '../../BottomSheet';
import { Button } from '../../Button';
import { Carousel } from '../../Carousel';
import { JsonViewer } from '../../JsonViewer';
import { Lightbox } from '../../Lightbox';
import { ListInput } from '../../ListInput';
import { MegaMenu } from '../../MegaMenu';
import { MultiSelect } from '../../MultiSelect';
import { OverflowList } from '../../OverflowList';
import { Thumbnail, ThumbnailList } from '../../Thumbnail';
import { Timer } from '../../Timer';
import { Tour } from '../../Tour';
import { TreeList } from '../../TreeList';
import { VirtualList } from '../../VirtualList';
import { TransferList } from '../TransferList';

const items = [
  { value: 'report', label: 'Report' },
  { value: 'notes', label: 'Notes' },
];
const preview =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120"><circle cx="80" cy="60" r="40" fill-opacity="0.2"/></svg>',
  );

/** Caller content stays English; built-in labels follow the Spanish provider. */
export default function TransferListCatalogDefaults() {
  const [tourOpen, setTourOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [files, setFiles] = useState(['report.pdf', 'upload.csv', 'retry.pdf']);
  const [retrying, setRetrying] = useState(false);
  return (
    <I18nProvider locale="es">
      <div className="grid max-w-2xl gap-6" data-i18n-catalog>
        <p className="text-sm text-muted-foreground">
          Spanish defaults, English caller content. Labels and function overrides still take precedence.
        </p>
        <TransferList items={items} />
        <TreeList
          aria-label="Remote files"
          nodes={[{ id: 'remote', label: 'Remote', hasChildren: true }]}
          loadChildren={() => Promise.reject(new Error('Offline example'))}
        />
        <div className="flex gap-4">
          <Timer start={0} end={3725000} status="paused" format="compact" />
          <Timer start={0} end={65000} status="stopped" format="compact" />
        </div>
        <ListInput label="Variables" defaultValue={[{ key: 'REGION', value: 'west' }]} secret />
        <Carousel label="Documents" showDots autoplay={5000}>
          <div>Report</div>
          <div>Notes</div>
        </Carousel>
        <JsonViewer data={{ report: { name: 'Quarterly report', pages: 3 }, tags: ['draft'] }} />
        <VirtualList items={[]} renderItem={() => null} height={80} />
        <MegaMenu items={[{ id: 'overview', label: 'Overview', href: '#overview' }]} />
        <OverflowList items={['Report', 'Notes', 'Archive', 'Draft']} max={1} renderItem={(item) => item} />
        <ThumbnailList aria-label="Files">
          {files.map((name) => (
            <Thumbnail
              key={name}
              name={name}
              progress={name === 'upload.csv' || (name === 'retry.pdf' && retrying) ? 40 : undefined}
              error={name === 'retry.pdf' && !retrying}
              onRemove={() => setFiles((current) => current.filter((file) => file !== name))}
              onRetry={name === 'retry.pdf' ? () => setRetrying(true) : undefined}
            />
          ))}
        </ThumbnailList>
        <Button
          variant="secondary"
          onClick={() => {
            setFiles(['report.pdf', 'upload.csv', 'retry.pdf']);
            setRetrying(false);
          }}
        >
          Reset files
        </Button>
        <MultiSelect label="Documents" options={items} defaultValue={['report']} />
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setTourOpen(true)}>Start tour</Button>
          <Button onClick={() => setMediaOpen(true)}>View media</Button>
          <BottomSheet>
            <BottomSheetTrigger render={<Button />}>Open sheet</BottomSheetTrigger>
            <BottomSheetContent title="Report details" description="Resize using the handle or arrow keys.">
              Quarterly report
            </BottomSheetContent>
          </BottomSheet>
        </div>
        <Tour
          open={tourOpen}
          onOpenChange={setTourOpen}
          steps={[
            { target: '#missing-target', title: 'Report' },
            { target: '#missing-target', title: 'Notes' },
          ]}
        />
        <Lightbox
          open={mediaOpen}
          onOpenChange={setMediaOpen}
          items={[
            { src: preview, alt: 'Report preview' },
            { src: preview, alt: 'Notes preview' },
          ]}
        />
      </div>
    </I18nProvider>
  );
}
