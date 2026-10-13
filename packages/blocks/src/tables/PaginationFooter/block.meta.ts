import type { BlockMeta } from '../../meta';
import { labelDescription, labelDocs } from './labels.doc';

export const meta: BlockMeta = {
  name: 'Pagination footer',
  labels: labelDocs.map(([key, type, state]) => ({ key, type, state })),
  family: 'tables',
  status: 'beta',
  description:
    labelDescription +
    ' ' +
    'Table footer with a rows-per-page Select, a "1–10 of 97" summary and numbered Pagination; controlled or uncontrolled.',
  uses: ['SimpleSelect', 'Pagination'],
};
