## Purpose

Tool call card for assistant turns: a tool invocation's name, status and duration, with a collapsible body that shows its arguments and its result or error.

## ADDED Requirements

### Requirement: Awaiting-approval calls offer Approve and Deny outside the header

When `status` is `awaiting-approval`, ToolCallCard SHALL render a group named by the approval prompt with Approve and Deny buttons outside the collapsible trigger, visible whether or not the panel is open, and SHALL open the panel to show the arguments on entering that state unless `open` is controlled.

#### Scenario: Approval requested

- **GIVEN** a card `delete_project` with args `{ id: 'p1' }` and `onApprove` and `onDeny` set
- **WHEN** it renders with `status="awaiting-approval"`
- **THEN** a group named Allow this tool call? holds the buttons Approve and Deny
- **AND** the Arguments section is visible
- **AND** the header button contains no other button

#### Scenario: Controlled closed panel

- **GIVEN** `open={false}` is controlled
- **WHEN** the status becomes `awaiting-approval`
- **THEN** the panel stays closed
- **AND** Approve and Deny are still visible

### Requirement: Deny collects an optional reason before calling onDeny

Activating Deny SHALL reveal a labelled single-line reason field with Deny and Cancel actions and move focus to it. Submitting SHALL call `onDeny` once with the trimmed reason, or `undefined` when empty; Escape or Cancel SHALL restore the buttons with focus on Deny without calling it. With `askDenyReason` set to false, Deny SHALL call `onDeny()` at once.

#### Scenario: Reason given

- **WHEN** the user activates Deny, types `Wrong project` and presses Enter
- **THEN** `onDeny` is called once with `Wrong project`

#### Scenario: Reason step cancelled

- **WHEN** the user activates Deny and presses Escape
- **THEN** Approve and Deny are shown again
- **AND** focus is on Deny
- **AND** `onDeny` is not called

### Requirement: Approval callbacks run once and show a busy state

When `onApprove` or `onDeny` returns a promise, the pressed button SHALL show its loading state with `aria-busy` and both decision buttons SHALL stay disabled until the promise settles; repeated activation MUST NOT call the handler again, and a rejected promise SHALL re-enable the buttons.

#### Scenario: Double click while pending

- **GIVEN** `onApprove` returns a promise that has not settled
- **WHEN** the user clicks Approve twice
- **THEN** `onApprove` is called once
- **AND** Approve has `aria-busy="true"`

#### Scenario: Rejected approval

- **WHEN** the promise returned by `onApprove` rejects
- **THEN** Approve and Deny are enabled again

### Requirement: Destructive tools use destructive tone and explicit approve wording

With `destructive`, the Approve button SHALL use the destructive variant and read `Run {name}` unless `approveLabel` is set, and the reversibility hint SHALL be the accessible description of the approval group.

#### Scenario: Destructive approval

- **GIVEN** a card `delete_project` awaiting approval with `destructive`
- **WHEN** it renders
- **THEN** the Approve button is named Run delete_project and uses the destructive variant
- **AND** the group is described by This action may not be reversible.

### Requirement: Card keeps the human decision after the status moves on

When `decision` is set, ToolCallCard SHALL show Approved, or Denied with the reason when one was given, in its body for any status. The `denied` status SHALL show the denied verb and tag, and decision buttons MUST NOT render for any status other than `awaiting-approval`.

#### Scenario: Denied with a reason

- **WHEN** the card renders with `status="denied"` and `decision={{ outcome: 'denied', reason: 'Wrong project' }}`
- **THEN** the header reads Denied call to delete_project
- **AND** the body shows Denied: Wrong project
- **AND** no Approve or Deny button renders

#### Scenario: Approved and finished

- **WHEN** the card renders with `status="succeeded"` and `decision={{ outcome: 'approved' }}`
- **THEN** the body shows Approved above the result

### Requirement: Approval request is announced politely without moving focus

When a card enters `awaiting-approval`, a polite status region SHALL announce `{name} needs your approval` once per entry, and focus MUST NOT move.

#### Scenario: Running call starts waiting

- **GIVEN** focus is in the chat composer
- **WHEN** a card `delete_project` re-renders from `running` to `awaiting-approval`
- **THEN** the status region reads delete_project needs your approval once
- **AND** focus stays in the composer
