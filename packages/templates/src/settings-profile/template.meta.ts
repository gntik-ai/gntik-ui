import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Profile settings',
  family: 'Settings',
  priority: 'P1',
  status: 'beta',
  description:
    "Personal profile defaults to mode='editable': avatar header, name and email, locale and time zone, with a sticky save bar. Opt into mode='read-only' for an initials avatar without upload or Edit actions, identity and optional context description lists, and optional ordered roles badges. identity/context accept { id, label, value, mono } rows; value may be a link. contextFallback supplies missing-value text; emptyRolesMessage supplies the empty roles state. Omitted roles/context hide their sections. Read-only mode passes saveBar='none' through SettingsFrame and has no profile form controls, copy buttons or save actions; the responsive section navigation remains available.",
  layout: 'SettingsLayout',
  blocks: [
    'app-sidebar',
    'app-topbar',
    'page-header',
    'profile-header',
    'form-section',
    'sticky-action-bar',
    'description-list-card',
    'section-header',
  ],
};
