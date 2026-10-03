/** Slot classes for ModelPicker. */
export const modelPickerStyles = {
  trigger: 'w-auto max-w-full min-w-0',
  compactTrigger: 'h-7 w-auto max-w-56 min-w-0 gap-1 border-transparent bg-transparent ps-2 pe-1.5 shadow-none hover:bg-secondary/70 hover:border-transparent',
  triggerValue: 'flex min-w-0 items-center gap-1.5',
  triggerIcon: 'shrink-0 text-muted-foreground',
  triggerName: 'truncate font-medium',
  triggerProvider: 'truncate text-muted-foreground',
  popup: 'w-80 max-w-[calc(100vw-2rem)]',
  item: 'items-start',
  itemBody: 'flex min-w-0 flex-col gap-1 py-0.5 whitespace-normal',
  itemName: 'font-medium text-foreground',
  itemDescription: 'text-[11.5px] leading-4 text-muted-foreground',
  badges: 'flex flex-wrap gap-1',
  reason: 'text-[11.5px] leading-4 text-muted-foreground italic',
} as const;
