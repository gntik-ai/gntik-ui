## Purpose

SchemaForm and SchemaFields render and validate react-hook-form forms from a JSON Schema subset using kit controls.

## ADDED Requirements

### Requirement: Supported schema types render matching kit controls

SchemaForm SHALL render string, numeric, boolean, enum, date, password, string-array, object-array and object properties with the matching kit control. Enums of at most five options SHALL use RadioGroup; longer enums SHALL use SimpleSelect. oneOf const/title choices SHALL display titles and submit consts.

#### Scenario: Tool parameters

- **GIVEN** required query titled Query, integer limit bounded 1–50 defaulting to 10, safe defaulting to true, three region choices and string-array tags
- **WHEN** the form renders
- **THEN** it shows labelled Input, NumberInput showing 10, checked Switch, RadioGroup and TokenInput

#### Scenario: Dates and secrets

- **WHEN** a schema has a date string and a writeOnly string
- **THEN** it renders DatePicker and PasswordInput
- **AND** the date submits an ISO calendar day such as 2026-10-01

#### Scenario: Long enum

- **WHEN** an enum has eight options
- **THEN** SimpleSelect exposes all eight options

### Requirement: Schema and ui presentation remains plain text

Fields SHALL derive labels from title or humanised keys, show descriptions and required markers, and apply path-based ui widget, label, description, placeholder, hidden and order overrides. Schema text MUST render as React text nodes, never HTML. columns SHALL support one or two columns.

#### Scenario: Required title and order

- **GIVEN** query is required and titled Query and ui.limit.order is 0
- **WHEN** the form renders
- **THEN** Query has a required marker and Limit renders first

#### Scenario: Untrusted description

- **WHEN** description contains <img src=x onerror=alert(1)>
- **THEN** the literal text is displayed and no image element is created

### Requirement: Validation produces translated nested issues

Built-in validation SHALL cover required, type, enum, const, numeric bounds, multipleOf, string lengths, pattern, email/uri/date formats, array bounds and uniqueness. Issues MUST be SchemaIssue[] mapped through issuesToErrors. Invalid submit SHALL show translated messages, focus the first invalid field and prevent onSubmit. A supplied resolver SHALL fully replace built-in validation and transformation.

#### Scenario: Required and maximum

- **WHEN** empty required query is submitted
- **THEN** it shows Required (Obligatorio in Spanish), receives focus and prevents onSubmit
- **AND** limit 60 with maximum 50 shows Enter 50 or less.

#### Scenario: Bounded pattern input

- **WHEN** pattern input exceeds maxLength or 1000 characters without maxLength
- **THEN** validation fails before evaluating the regex
- **AND** invalid pattern syntax never throws during rendering

#### Scenario: Untrusted property paths

- **GIVEN** a schema contains a property named **proto** with an invalid nested field
- **WHEN** validation issues are mapped
- **THEN** the error is stored as an own property at its nested path
- **AND** Object.prototype is unchanged

### Requirement: Submission follows schema values

SchemaForm SHALL apply defaults, coerce numbers and omit optional empty strings and arrays.

#### Scenario: Exact typed payload

- **GIVEN** limit defaults to 10, safe defaults to true and optional tags is empty
- **WHEN** query gntik and region eu are submitted
- **THEN** onSubmit receives exactly {query:'gntik',limit:10,safe:true,region:'eu'}

### Requirement: Nested objects and arrays use named groups

Objects SHALL render fieldsets with accessible legends and dotted field names. Object arrays SHALL render FieldArray honoring minItems and maxItems. Local references to #/$defs SHALL resolve.

#### Scenario: Referenced authentication

- **WHEN** auth references an Authentication object containing token
- **THEN** a fieldset named Authentication contains an input named auth.token

#### Scenario: Empty required list

- **GIVEN** headers is an object array with minItems 1
- **WHEN** submitted empty
- **THEN** it shows Add at least 1 item.

### Requirement: Custom widgets retain validation

A registered widget chosen by ui SHALL receive name, schema, controlProps and fieldState, with schema validation remaining active. Default controls MUST use kit value or checked bindings for focus-on-error.

#### Scenario: Model picker

- **GIVEN** ui.model.widget is model and widgets.model exists
- **WHEN** model is rendered and submitted empty while required
- **THEN** the custom widget receives its control props and invalid field state

### Requirement: Unsupported schemas use a JSON fallback

Unsupported keywords SHALL render a JSON textarea whose input must parse. Development SHALL log one warning naming the unsupported keyword per field and keyword; production SHALL log none.

#### Scenario: Conditional schema

- **GIVEN** a property uses if and then
- **WHEN** the user submits {oops
- **THEN** it shows Enter valid JSON. and a single development warning names if

### Requirement: Optional entry and existing form composition

SchemaForm, SchemaFields and their public types SHALL be exported only from the optional forms entry. SchemaFields SHALL accept control or FormProvider and validate in FormDialog with useFormDialog. All examples SHALL have translated copy, full keyboard operation and clean axe results in dark, light and high_contrast.

#### Scenario: Invalid dialog submission

- **WHEN** SchemaFields with an empty required query submits through useFormDialog
- **THEN** the dialog stays open and query receives focus
- **AND** the root entry does not export SchemaForm
