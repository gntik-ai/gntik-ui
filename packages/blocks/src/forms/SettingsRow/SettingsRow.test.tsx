import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@gntik-ai/ui';
import { expectNoAxeViolations } from '../../test/a11y';
import { SettingsRow } from './SettingsRow';

describe('SettingsRow', () => {
  it('renders a labelled, described switch', async () => {
    const { container } = render(<SettingsRow />);
    const sw = screen.getByRole('switch', { name: 'Deployment notifications' });
    expect(sw).toHaveAccessibleDescription(/deployment fails/);
    expect(sw).toBeChecked();
    await expectNoAxeViolations(container);
  });

  it('toggles and reports the new state', async () => {
    const onCheckedChange = vi.fn();
    render(<SettingsRow label="Weekly digest" description={null} defaultChecked={false} onCheckedChange={onCheckedChange} />);
    await userEvent.click(screen.getByRole('switch', { name: 'Weekly digest' }));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('wires a custom control through the ids', async () => {
    const { container } = render(
      <SettingsRow
        label="Default region"
        description="New projects are created here."
        control={({ labelId }) => (
          <Select defaultValue="eu" items={[{ value: 'eu', label: 'Europe' }, { value: 'us', label: 'United States' }]}>
            <SelectTrigger aria-labelledby={labelId} />
            <SelectContent>
              <SelectItem value="eu">Europe</SelectItem>
              <SelectItem value="us">United States</SelectItem>
            </SelectContent>
          </Select>
        )}
      />,
    );
    expect(screen.getByRole('combobox', { name: /Default region/ })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });
});
