import { en } from '../../i18n/messages/en';
import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Text',
  group: 'Display',
  status: 'stable',
  description: en['typography.description'],
  primitive: '@base-ui/react/use-render',
  tokens: [
    'type-display-size',
    'type-heading-xl-size',
    'type-heading-lg-size',
    'type-heading-md-size',
    'type-heading-sm-size',
    'type-heading-xs-size',
    'type-heading-2xs-size',
    'type-body-size',
    'type-label-size',
    'type-supporting-size',
    'type-caption-size',
    'foreground',
    'muted-foreground',
    'primary-text',
    'success-text',
    'warning-text',
    'destructive-text',
    'secondary',
  ],
};
