# Change: Add named z-index layers

## Why

Equal z-50 values leave overlay stacking to DOM order: a startup toaster can paint under a later modal, and popup and sticky layers have no shared vocabulary.

## What Changes

- Add thirteen ordered layers and static Tailwind utilities, exported as CSS, DTCG number tokens and typed constants.
- Move kit overlay and in-page stacking classes onto named layers, preserving sticky and docked values.
- Reject raw stacking utilities through the existing brand lint gate, allowing z-0 and z-auto.
- Document modal composition and demonstrate layered popups, toasts and tooltips.

## Impact

- Affected specs: tokens/z-index, ui/overlay-stacking (all requirements are ADDED).
- Affected packages: tokens, ui, blocks, chat, charts, flow.
- App z-50 sits below kit overlays. Close a Popover before opening a Dialog from it.
- No changes to frozen tokens, Figma exports, portals, focus management or visual baselines.
