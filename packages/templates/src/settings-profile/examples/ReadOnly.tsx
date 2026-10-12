import SettingsProfilePage from '../Page';

/** Read-only session details, assigned roles and active context. */
export default function ReadOnly() {
  return (
    <SettingsProfilePage
      mode="read-only"
      profile={{ name: 'Avery Collins', role: 'Viewer', headline: 'avery@example.com' }}
      identity={[
        { id: 'username', label: 'Username', value: 'avery' },
        { id: 'email', label: 'Email', value: 'avery@example.com' },
        {
          id: 'help',
          label: 'Help',
          value: (
            <a className="text-primary-text underline" href="mailto:support@example.com">
              Contact support
            </a>
          ),
        },
      ]}
      context={[
        { id: 'organization', label: 'Active organization', value: 'Example organization' },
        { id: 'workspace', label: 'Active workspace', value: null },
      ]}
      contextFallback="Nothing selected"
      roles={['Viewer', 'Auditor']}
      emptyRolesMessage="No roles assigned to this account"
    />
  );
}
