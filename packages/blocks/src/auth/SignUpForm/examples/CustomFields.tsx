import { SignUpForm } from '../SignUpForm';

/** Ordered text/email fields, kit validation, and values.fields keyed by these ids. */
export default function CustomFields() {
  return (
    <SignUpForm
      sso={null}
      minPasswordLength={12}
      passwordHelp={(minimum) => `Use at least ${minimum} characters.`}
      fields={[
        {
          id: 'username',
          label: 'Username',
          placeholder: 'Account name',
          help: 'Choose your account name.',
          required: true,
          type: 'text',
          autoComplete: 'username',
        },
        {
          id: 'displayName',
          label: 'Display name',
          placeholder: 'Avery Collins',
          help: 'The name others will see.',
          required: true,
          autoComplete: 'name',
        },
        {
          id: 'email',
          label: 'Email',
          placeholder: 'you@example.com',
          help: 'For account notifications.',
          required: true,
          type: 'email',
          autoComplete: 'email',
        },
        {
          id: 'tenant',
          label: 'Tenant identifier',
          placeholder: 'Organization',
          help: 'Your organization identifier.',
          required: true,
          autoComplete: 'off',
        },
        {
          id: 'workspace',
          label: 'Workspace identifier',
          placeholder: 'Workspace',
          help: 'Optional. Leave empty to choose later.',
          required: false,
          autoComplete: 'off',
        },
      ]}
    />
  );
}
