import { tv, type VariantProps } from '../../utils/tv';

export const sidebarLayoutVariants = tv({
  slots: {
    root: 'relative flex w-full min-w-0 overflow-hidden bg-background font-sans text-foreground',
    skip: 'focus:absolute',
    sidebar: [
      'hidden shrink-0 flex-col overflow-hidden border-e border-border/60 bg-chrome lg:flex',
      'transition-[width] duration-200 motion-reduce:transition-none',
    ],
    sidebarHeader: 'flex shrink-0 items-center px-3 pt-4 pb-3',
    sidebarBody: 'min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 pt-1 pb-3',
    sidebarFooter: 'shrink-0 p-2.5',
    column: 'flex min-h-0 min-w-0 flex-1 flex-col',
    topbar: 'flex h-14 shrink-0 items-center gap-2 border-b border-border/60 bg-chrome px-3 lg:gap-3 lg:px-5',
    topbarContent: 'flex min-w-0 flex-1 items-center gap-2 lg:gap-3',
    menuButton: 'lg:hidden',
    collapseButton: 'hidden lg:inline-flex',
    main: 'min-h-0 flex-1 overflow-y-auto focus:outline-none',
    drawer: 'bg-chrome',
    drawerHeader: 'px-3',
    drawerBody: 'flex flex-col gap-3 px-3 py-3',
  },
  variants: {
    fullScreen: { true: { root: 'h-dvh' }, false: { root: 'h-full min-h-0' } },
    state: {
      expanded: { sidebar: 'w-[248px]' },
      rail: { sidebar: 'w-16', sidebarHeader: 'justify-center px-2', sidebarBody: 'px-2', sidebarFooter: 'px-2' },
      offcanvas: { sidebar: 'w-0 border-e-0' },
    },
  },
  defaultVariants: { fullScreen: false, state: 'expanded' },
});

export type SidebarLayoutVariantProps = VariantProps<typeof sidebarLayoutVariants>;
