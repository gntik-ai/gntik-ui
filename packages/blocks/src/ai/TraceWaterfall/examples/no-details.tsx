import { TraceWaterfall } from '../TraceWaterfall';

/** Waterfall only: the page shows the selected span elsewhere (e.g. a drawer). */
export default function TraceWaterfallWithoutDetails() {
  return <TraceWaterfall showDetails={false} onSelect={() => {}} />;
}
