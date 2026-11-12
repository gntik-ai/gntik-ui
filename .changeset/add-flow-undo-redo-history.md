---
'@gntik-ai/flow': minor
'@gntik-ai/blocks': minor
'@gntik-ai/ui': minor
'@gntik-ai/templates': minor
---

Add useStateHistory and an opt-in history option for useFlowState (undo, redo, canUndo, canRedo, resetHistory), and Undo and Redo in FlowBuilder (header buttons, Mod+Z, Shift+Mod+Z and Ctrl+Y, announcements in en and es) with a history prop that WorkflowBuilderPage passes through. FlowGraphChange type gains "undo" and "redo": widen any exhaustive switch over it.
