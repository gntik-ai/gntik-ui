// Lazy loaders for everything the viewers can preview, keyed by kind → id (the ids of
// kit-registry.json). Blocks render with their built-in fixtures; templates and layout
// examples are default exports.
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

const blockModules = import.meta.glob('../../../packages/blocks/src/*/*/*.tsx');
const blockLabelExamples = import.meta.glob('../../../packages/blocks/src/*/*/examples/{Spanish,Labels}.tsx');
const blockMetas = import.meta.glob('../../../packages/blocks/src/*/*/block.meta.ts', { eager: true, import: 'meta' });
const templateModules = import.meta.glob('../../../packages/templates/src/*/Page.tsx');
const templateMetas = import.meta.glob('../../../packages/templates/src/*/template.meta.ts', {
  eager: true,
  import: 'meta',
});
const layoutExamples = import.meta.glob('../../../packages/ui/src/layouts/*/examples/*.tsx');
const layoutDocs = import.meta.glob('../../../packages/ui/src/layouts/*/*.doc.ts', { eager: true, import: 'doc' });
const sourcesRaw = {
  ...import.meta.glob('../../../packages/templates/src/*/examples/*.tsx', { query: '?raw', import: 'default' }),
  ...import.meta.glob('../../../packages/blocks/src/*/*/examples/*.tsx', { query: '?raw', import: 'default' }),
  ...import.meta.glob('../../../packages/blocks/src/*/*/*.tsx', { query: '?raw', import: 'default' }),
  ...import.meta.glob('../../../packages/templates/src/*/Page.tsx', { query: '?raw', import: 'default' }),
  ...import.meta.glob('../../../packages/ui/src/layouts/*/examples/*.tsx', { query: '?raw', import: 'default' }),
};

const BLOCKS = Object.entries(blockMetas)
  .map(([metaPath, meta]) => {
    const dir = metaPath.slice(0, metaPath.lastIndexOf('/'));
    const name = dir.slice(dir.lastIndexOf('/') + 1);
    const family = dir.split('/').at(-2);
    const file = `${dir}/${name}.tsx`;
    return { id: kebab(name), name, family, meta, file, load: blockModules[file] };
  })
  .filter((b) => b.load)
  .sort((a, b) => a.family.localeCompare(b.family) || a.name.localeCompare(b.name));

const TEMPLATES = Object.entries(templateMetas)
  .map(([metaPath, meta]) => {
    const dir = metaPath.slice(0, metaPath.lastIndexOf('/'));
    const id = dir.slice(dir.lastIndexOf('/') + 1);
    const file = `${dir}/Page.tsx`;
    return { id, meta, file, load: templateModules[file] };
  })
  .filter((t) => t.load);

const LAYOUTS = Object.entries(layoutDocs).flatMap(([docPath, doc]) => {
  const dir = docPath.slice(0, docPath.lastIndexOf('/'));
  const folder = dir.slice(dir.lastIndexOf('/') + 1);
  return Object.keys(layoutExamples)
    .filter((p) => p.startsWith(dir + '/examples/'))
    .sort()
    .map((file) => {
      const example = file.slice(file.lastIndexOf('/') + 1, -4);
      return {
        id: `${kebab(folder)}--${kebab(example)}`,
        layout: folder,
        example,
        doc,
        file,
        load: layoutExamples[file],
      };
    });
});

const named = (b) => () => b.load().then((m) => ({ default: m[b.name] ?? m.default }));

export const PREVIEW_LOADERS = {
  block: {
    'csp-provider': () => import('../../../packages/ui/src/csp/examples/CSPProviderPreview'),
    'log-viewer--wrap': () => import('../../../packages/blocks/src/builders/LogViewer/examples/Wrap'),
    'theme-scope': () => import('../../../packages/ui/src/theme/examples/ThemeScopeLightCard'),
    'theme-scope--nested': () => import('../../../packages/ui/src/theme/examples/ThemeScopeNested'),
    'motion-dialog': () => import('../../../packages/ui/src/components/Dialog/examples/DialogForm'),
    'theme-provider--motion': () => import('../../../packages/ui/src/theme/examples/ThemeProviderMotion'),
    'theme-provider--forced': () => import('../../../packages/ui/src/theme/examples/ThemeProviderForced'),
    ...Object.fromEntries(
      Object.entries(blockLabelExamples).map(([file, load]) => [
        `${kebab(file.split('/').at(-3))}--${file.endsWith('/Labels.tsx') ? 'labels' : 'spanish'}`,
        load,
      ]),
    ),
    'month-calendar--time-zone': () =>
      import('../../../packages/blocks/src/scheduling/MonthCalendar/examples/TimeZone'),
    'week-calendar--time-zone': () => import('../../../packages/blocks/src/scheduling/WeekCalendar/examples/TimeZone'),
    'agenda-list--time-zone': () => import('../../../packages/blocks/src/scheduling/AgendaList/examples/TimeZone'),
    'month-calendar--locale': () => import('../../../packages/blocks/src/scheduling/MonthCalendar/examples/Locale'),
    'week-calendar--locale': () => import('../../../packages/blocks/src/scheduling/WeekCalendar/examples/Locale'),
    'agenda-list--locale': () => import('../../../packages/blocks/src/scheduling/AgendaList/examples/Locale'),
    'flow-builder--controlled-graph': () =>
      import('../../../packages/blocks/src/builders/FlowBuilder/examples/ControlledGraph'),
    ...Object.fromEntries(BLOCKS.map((b) => [b.id, named(b)])),
    'page-header--spanish': () => import('../../../packages/blocks/src/page-chrome/PageHeader/examples/Spanish'),
    'confirm-destructive': () =>
      import('../../../packages/blocks/src/feedback/ConfirmDestructive/examples/PlainDeletion'),
    'confirm-destructive--extra-fields': () =>
      import('../../../packages/blocks/src/feedback/ConfirmDestructive/examples/SecretRevocation'),
    ...Object.fromEntries(
      [
        ['server', 'ServerFailure'],
        ['network', 'NetworkFailure'],
        ['no-access', 'NoAccessFailure'],
        ['not-found', 'NotFoundFailure'],
      ].map(([state, name]) => [
        `confirm-destructive--${state}`,
        () =>
          import('../../../packages/blocks/src/feedback/ConfirmDestructive/examples/FailureStates').then((module) => ({
            default: module[name],
          })),
      ]),
    ),
    'cursor-pager-footer--cursor-stack': () =>
      import('../../../packages/blocks/src/tables/CursorPagerFooter/examples/CursorStack'),
    'cursor-pager-footer--busy': () => import('../../../packages/blocks/src/tables/CursorPagerFooter/examples/Busy'),
    'cursor-pager-footer--hidden': () =>
      import('../../../packages/blocks/src/tables/CursorPagerFooter/examples/Hidden'),
    'cursor-pager-footer--rows-per-page': () =>
      import('../../../packages/blocks/src/tables/CursorPagerFooter/examples/RowsPerPage'),
    'load-more-footer--cursor': () => import('../../../packages/blocks/src/tables/LoadMoreFooter/examples/cursor'),
    'load-more-footer--flag': () => import('../../../packages/blocks/src/tables/LoadMoreFooter/examples/flag'),
    'load-more-footer--failed': () => import('../../../packages/blocks/src/tables/LoadMoreFooter/examples/failed'),
    'load-more-footer--exhausted': () =>
      import('../../../packages/blocks/src/tables/LoadMoreFooter/examples/exhausted'),
    'load-more-footer--cards': () => import('../../../packages/blocks/src/tables/LoadMoreFooter/examples/cards'),
    'data-table--single-selection': () =>
      import('../../../packages/blocks/src/tables/DataTable/examples/single-selection'),
    'data-table--server-pagination': () =>
      import('../../../packages/blocks/src/tables/DataTable/examples/server-pagination'),
    'data-table--client-selection': () =>
      import('../../../packages/blocks/src/tables/DataTable/examples/client-selection'),
    'data-table--paginated-single-selection': () =>
      import('../../../packages/blocks/src/tables/DataTable/examples/paginated-single-selection'),
    'plan-card--summary-full': () => import('../../../packages/blocks/src/billing/PlanCard/examples/SummaryFull'),
    'plan-card--summary-minimal': () => import('../../../packages/blocks/src/billing/PlanCard/examples/SummaryMinimal'),
    'plan-card--summary-unassigned': () =>
      import('../../../packages/blocks/src/billing/PlanCard/examples/SummaryUnassigned'),
    'plan-card--summary-unassigned-no-label': () =>
      import('../../../packages/blocks/src/billing/PlanCard/examples/SummaryUnassignedNoLabel'),
    'plan-card--summary-price-only': () =>
      import('../../../packages/blocks/src/billing/PlanCard/examples/SummaryPriceOnly'),
    'plan-card--summary-zero-price': () =>
      import('../../../packages/blocks/src/billing/PlanCard/examples/SummaryZeroPrice'),
    'plan-card--summary-renewal-only': () =>
      import('../../../packages/blocks/src/billing/PlanCard/examples/SummaryRenewalOnly'),
    'plan-card--summary-features-only': () =>
      import('../../../packages/blocks/src/billing/PlanCard/examples/SummaryFeaturesOnly'),
    'plan-card--summary-actions-only': () =>
      import('../../../packages/blocks/src/billing/PlanCard/examples/SummaryActionsOnly'),
    'plan-definition-card--compact': () =>
      import('../../../packages/blocks/src/billing/PlanDefinitionCard/examples/Compact'),
    'plan-definition-card--full': () => import('../../../packages/blocks/src/billing/PlanDefinitionCard/examples/Full'),
    'dialog-wizard': () => import('../../../packages/blocks/src/forms/DialogWizard/examples/CreateResource'),
    'credential-disclosure-dialog': () =>
      import('../../../packages/blocks/src/forms/CredentialDisclosureDialog/examples/Stored'),
    'credential-disclosure-dialog--stored': () =>
      import('../../../packages/blocks/src/forms/CredentialDisclosureDialog/examples/Stored'),
    'credential-disclosure-dialog--fresh': () =>
      import('../../../packages/blocks/src/forms/CredentialDisclosureDialog/examples/Fresh'),
    'credential-disclosure-dialog--multi-secret': () =>
      import('../../../packages/blocks/src/forms/CredentialDisclosureDialog/examples/MultiSecret'),
    'credential-disclosure-dialog--inline': () =>
      import('../../../packages/blocks/src/forms/CredentialDisclosureDialog/examples/Inline'),
    'credential-disclosure-dialog--issue-on-click': () =>
      import('../../../packages/blocks/src/forms/CredentialDisclosureDialog/examples/IssueOnClick'),
    'credential-disclosure-dialog--response-gating': () =>
      import('../../../packages/blocks/src/forms/CredentialDisclosureDialog/examples/ResponseGating'),
    'subordinate-list': () => import('../../../packages/blocks/src/tables/SubordinateList/examples/ResourceForm'),
    'truncated-collection-footer': () =>
      import('../../../packages/blocks/src/tables/TruncatedCollectionFooter/examples/exact'),
    'truncated-collection-footer--has-more': () =>
      import('../../../packages/blocks/src/tables/TruncatedCollectionFooter/examples/has-more'),
    'subordinate-list--loading': () => import('../../../packages/blocks/src/tables/SubordinateList/examples/loading'),
    'subordinate-list--empty': () => import('../../../packages/blocks/src/tables/SubordinateList/examples/empty'),
    'subordinate-list--error': () => import('../../../packages/blocks/src/tables/SubordinateList/examples/error'),
    'status-timeline--empty': () => import('../../../packages/blocks/src/data-display/StatusTimeline/examples/Empty'),
    'sign-up-form--custom-fields': () => import('../../../packages/blocks/src/auth/SignUpForm/examples/CustomFields'),
    'sign-up-form--no-terms': () => import('../../../packages/blocks/src/auth/SignUpForm/examples/NoTerms'),
    'sign-up-form--unavailable': () => import('../../../packages/blocks/src/auth/SignUpForm/examples/Unavailable'),
    'sign-up-form--loading': () => import('../../../packages/blocks/src/auth/SignUpForm/examples/Loading'),
    'sign-up-form--submitting': () => import('../../../packages/blocks/src/auth/SignUpForm/examples/Submitting'),
    'sign-up-form--error': () => import('../../../packages/blocks/src/auth/SignUpForm/examples/Error'),
    'sign-in-form--username': () => import('../../../packages/blocks/src/auth/SignInForm/examples/Username'),
    'forgot-password-form--username-or-email': () =>
      import('../../../packages/blocks/src/auth/ForgotPasswordForm/examples/UsernameOrEmail'),
  },
  template: {
    'resource-detail--spanish': () => import('../../../packages/templates/src/resource-detail/examples/Spanish'),
    'resource-detail--embedded-custom-tabs': () =>
      import('../../../packages/templates/src/resource-detail/examples/embedded-custom-tabs'),
    'resource-detail--labels': () => import('../../../packages/templates/src/resource-detail/examples/Labels'),
    'contact--failed-send': () => import('../../../packages/templates/src/contact/examples/FailedSend'),
    'contact--custom-failure': () => import('../../../packages/templates/src/contact/examples/CustomFailure'),
    'workflow-builder--save-graph': () => import('../../../packages/templates/src/workflow-builder/examples/SaveGraph'),
    ...Object.fromEntries(TEMPLATES.map((t) => [t.id, t.load])),
    'live-event-stream--connecting': () =>
      import('../../../packages/templates/src/live-event-stream/examples/Connecting'),
    'live-event-stream--live-empty': () =>
      import('../../../packages/templates/src/live-event-stream/examples/LiveEmpty'),
    'live-event-stream--live-with-events': () =>
      import('../../../packages/templates/src/live-event-stream/examples/LiveWithEvents'),
    'live-event-stream--error': () => import('../../../packages/templates/src/live-event-stream/examples/Error'),
    'live-event-stream--stopped': () => import('../../../packages/templates/src/live-event-stream/examples/Stopped'),
    'settings-profile--read-only': () => import('../../../packages/templates/src/settings-profile/examples/ReadOnly'),
    'resource-detail--runtime-with-transition': () =>
      import('../../../packages/templates/src/resource-detail/examples/runtime-with-transition'),
    'resource-detail--runtime-without-transition': () =>
      import('../../../packages/templates/src/resource-detail/examples/runtime-without-transition'),
    'resource-detail--realtime-configuration': () =>
      import('../../../packages/templates/src/resource-detail/examples/realtime-configuration'),
    'resource-detail--postgres-table-detail': () =>
      import('../../../packages/templates/src/resource-detail/examples/postgres-table-detail'),
    'create-wizard--uncontrolled-pending': () =>
      import('../../../packages/templates/src/create-wizard/examples/UncontrolledPending'),
    'create-wizard--uncontrolled-success': () =>
      import('../../../packages/templates/src/create-wizard/examples/UncontrolledSuccess'),
    'create-wizard--uncontrolled-error': () =>
      import('../../../packages/templates/src/create-wizard/examples/UncontrolledError'),
    'create-wizard--controlled-idle': () =>
      import('../../../packages/templates/src/create-wizard/examples/ControlledIdle'),
    'create-wizard--controlled-submitting': () =>
      import('../../../packages/templates/src/create-wizard/examples/ControlledSubmitting'),
    'create-wizard--controlled-success': () =>
      import('../../../packages/templates/src/create-wizard/examples/ControlledSuccess'),
    'create-wizard--controlled-error': () =>
      import('../../../packages/templates/src/create-wizard/examples/ControlledError'),
    'create-wizard--invite': () => import('../../../packages/templates/src/create-wizard/examples/Invite'),
    'create-wizard--overlay': () => import('../../../packages/templates/src/create-wizard/examples/Overlay'),
    'status-404--page-header': () => import('../../../packages/templates/src/status-404/examples/PageHeader'),
    'sign-in-card--username': () => import('../../../packages/templates/src/sign-in-card/examples/Username'),
    'forgot-password--username-or-email': () =>
      import('../../../packages/templates/src/forgot-password/examples/UsernameOrEmail'),
    'public-hub--full': () => import('../../../packages/templates/src/public-hub/examples/Full'),
    'public-hub--minimal': () => import('../../../packages/templates/src/public-hub/examples/Minimal'),
    'public-hub--loading': () => import('../../../packages/templates/src/public-hub/examples/Loading'),
    'public-hub--minimal-loading': () => import('../../../packages/templates/src/public-hub/examples/MinimalLoading'),
  },
  layout: Object.fromEntries(LAYOUTS.map((l) => [l.id, l.load])),
};
export const CATALOG = { blocks: BLOCKS, templates: TEMPLATES, layouts: LAYOUTS };
export const loadSource = (file) => (sourcesRaw[file] ? sourcesRaw[file]() : Promise.resolve(''));
