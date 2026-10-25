## Purpose

Stacking order of the overlays in @gntik-ai/ui: the layers that backdrops, modal surfaces, popups, toasts and tooltips use, so nested and concurrent overlays paint in a predictable order.

## ADDED Requirements

### Requirement: Toasts and tooltips paint above modal overlays

The Toaster viewport SHALL use the toast layer and tooltips the tooltip layer, both above the overlay and modal layers, so a toast or tooltip shown while a modal is open MUST be visible above its backdrop.

#### Scenario: Toast while a dialog is open

- **GIVEN** a Toaster mounted at start-up
- **AND** an open Dialog
- **WHEN** useToast().add() shows a toast
- **THEN** the toast paints above the dialog backdrop
- **AND** its close button receives clicks

### Requirement: Popups opened inside a modal paint above it

Popover, Menu, Select, Combobox, HoverCard and PowerSearch positioners SHALL use the popover layer, above the modal layer, so a popup opened from inside a Dialog or Drawer MUST render above that Dialog or Drawer. Dialogs opened from menus and nested dialogs SHALL retain Base UI portal ordering. Sticky table heads SHALL stay below popovers and the StackedLayout header, and pinned header cells SHALL stay above pinned body cells.

#### Scenario: Select inside a drawer

- **GIVEN** an open Drawer with a Select
- **WHEN** the Select is opened
- **THEN** its listbox paints above the Drawer popup
