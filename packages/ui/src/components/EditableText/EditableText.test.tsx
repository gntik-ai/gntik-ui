import { useState } from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import PageTitle from './examples/PageTitle';
import DoubleClick from './examples/DoubleClick';
import EditButton from './examples/EditButton';
import Multiline from './examples/Multiline';
import Controlled from './examples/Controlled';
import SaveStates from './examples/SaveStates';
import LowLevel from './examples/LowLevel';
import { I18nProvider } from '../../i18n';
import { EditableText } from './EditableText';

describe('EditableText', () => {
  it('opens by click or Enter with the labelled value selected', async () => {
    const user = userEvent.setup();
    render(<EditableText defaultValue="Support agent" label="Agent name" onSave={() => {}} />);
    const preview = screen.getByRole('button', { name: 'Support agent' });
    expect(preview).toHaveAccessibleDescription('Press Enter to edit');
    await user.tab();
    await user.keyboard('{Enter}');
    const input = screen.getByRole('textbox', { name: 'Agent name' }) as HTMLInputElement;
    expect(input).toHaveFocus();
    expect(input.value).toBe('Support agent');
    expect([input.selectionStart, input.selectionEnd]).toEqual([0, 13]);
  });
  it('saves once, keeps a busy read-only field, then focuses the updated preview', async () => {
    const user = userEvent.setup();
    let resolve!: () => void;
    const onSave = vi.fn(
      () =>
        new Promise<void>((done) => {
          resolve = done;
        }),
    );
    const { container } = render(<EditableText defaultValue="Support agent" label="Agent name" onSave={onSave} />);
    await user.click(screen.getByRole('button', { name: 'Support agent' }));
    const input = screen.getByRole('textbox', { name: 'Agent name' });
    await user.clear(input);
    await user.type(input, 'Billing agent');
    await user.keyboard('{Enter}{Enter}');
    expect(onSave).toHaveBeenCalledExactlyOnceWith('Billing agent');
    expect(input).toHaveAttribute('readonly');
    expect(input).toHaveAttribute('aria-busy', 'true');
    expect(input).toHaveFocus();
    expect(screen.getByRole('status', { name: 'Saving…' })).toBeInTheDocument();
    expect(container.firstChild).toHaveAttribute('data-pending');
    await act(async () => resolve());
    expect(screen.getByRole('button', { name: 'Billing agent' })).toHaveFocus();
  });
  it.each([
    ['string', () => 'Name already taken', 'Name already taken'],
    ['false', () => false, 'The change could not be saved.'],
    [
      'throw',
      () => {
        throw new Error('Network down');
      },
      'Network down',
    ],
    ['reject', () => Promise.reject(new Error('Network down')), 'Network down'],
    ['unknown rejection', () => Promise.reject(null), 'The change could not be saved.'],
  ])('keeps the field open and described by a %s failure', async (_, onSave, message) => {
    const user = userEvent.setup();
    const { container } = render(<EditableText defaultValue="Support agent" label="Agent name" onSave={onSave} />);
    await user.click(screen.getByRole('button', { name: 'Support agent' }));
    const input = screen.getByRole('textbox', { name: 'Agent name' });
    await user.clear(input);
    await user.type(input, 'Billing agent{Enter}');
    expect(await screen.findByRole('alert')).toHaveTextContent(message);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(message);
    expect(input).toHaveFocus();
    expect(input).not.toHaveAttribute('readonly');
    expect(container.firstChild).toHaveAttribute('data-invalid');
  });

  it('uses the Spanish generic failure message', async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider locale="es">
        <EditableText defaultValue="Support agent" label="Agent name" onSave={() => false} />
      </I18nProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Support agent' }));
    await user.type(screen.getByRole('textbox'), 'x{Enter}');
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo guardar el cambio.');
  });

  it('double-click activation ignores a single click and retains Enter activation', async () => {
    const user = userEvent.setup();
    render(<EditableText defaultValue="Support agent" label="Agent name" activation="dblclick" onSave={() => {}} />);
    const preview = screen.getByRole('button', { name: 'Support agent' });
    await user.click(preview);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    await user.dblClick(preview);
    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it('double-click preview also opens with Enter', async () => {
    const user = userEvent.setup();
    render(<EditableText defaultValue="Support agent" label="Agent name" activation="dblclick" onSave={() => {}} />);
    await user.tab();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it('button activation edits only from the labelled icon button', async () => {
    const user = userEvent.setup();
    render(<EditableText defaultValue="Support agent" label="Agent name" activation="button" onSave={() => {}} />);
    await user.click(screen.getByText('Support agent'));
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Support agent' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Edit Agent name' }));
    expect(screen.getByRole('textbox', { name: 'Agent name' })).toHaveFocus();
  });

  it('Escape restores the value, calls onCancel, and focuses the preview', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onCancel = vi.fn();
    render(<EditableText defaultValue="Support agent" label="Agent name" onSave={onSave} onCancel={onCancel} />);
    await user.click(screen.getByRole('button', { name: 'Support agent' }));
    await user.type(screen.getByRole('textbox'), 'Draft{Escape}');
    expect(screen.getByRole('button', { name: 'Support agent' })).toHaveFocus();
    expect(onSave).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalledOnce();
    await user.click(screen.getByRole('button', { name: 'Support agent' }));
    expect(screen.getByRole('textbox')).toHaveValue('Support agent');
  });

  it('exits an unchanged value without saving', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<EditableText defaultValue="Support agent" label="Agent name" onSave={onSave} />);
    await user.click(screen.getByRole('button', { name: 'Support agent' }));
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: 'Support agent' })).toHaveFocus();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('validates the trimmed value and blocks saving invalid input', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const validate = (value: string) => (value ? undefined : 'Name is required');
    render(<EditableText defaultValue="Support agent" label="Agent name" onSave={onSave} validate={validate} />);
    await user.click(screen.getByRole('button', { name: 'Support agent' }));
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '  {Enter}');
    expect(screen.getByRole('alert')).toHaveTextContent('Name is required');
    expect(input).toHaveFocus();
    expect(onSave).not.toHaveBeenCalled();
    await user.clear(input);
    await user.type(input, '  Ops  {Enter}');
    expect(onSave).toHaveBeenCalledExactlyOnceWith('Ops');
    expect(screen.getByRole('button', { name: 'Ops' })).toHaveFocus();
  });

  it('preserves whitespace with trim=false and honours maxLength', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <EditableText defaultValue="" placeholder="Name" label="Agent name" onSave={onSave} trim={false} maxLength={5} />,
    );
    await user.click(screen.getByRole('button'));
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', 'Name');
    await user.type(input, ' Ops extra{Enter}');
    expect(onSave).toHaveBeenCalledExactlyOnceWith(' Ops ');
  });

  it.each([true, false])('Tab blurs with submitOnBlur=%s and preserves the target focus', async (submitOnBlur) => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onCancel = vi.fn();
    render(
      <>
        <EditableText
          defaultValue="Support agent"
          label="Agent name"
          onSave={onSave}
          onCancel={onCancel}
          submitOnBlur={submitOnBlur}
        />
        <button type="button">Delete</button>
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'Support agent' }));
    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), 'Ops');
    await user.tab();
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveFocus();
    if (submitOnBlur) {
      expect(onSave).toHaveBeenCalledExactlyOnceWith('Ops');
      expect(onCancel).not.toHaveBeenCalled();
    } else {
      expect(onSave).not.toHaveBeenCalled();
      expect(onCancel).toHaveBeenCalledOnce();
    }
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('saves on blur by default, without moving focus on asynchronous success', async () => {
    const user = userEvent.setup();
    let resolve!: () => void;
    const onSave = vi.fn(
      () =>
        new Promise<void>((done) => {
          resolve = done;
        }),
    );
    render(
      <>
        <EditableText defaultValue="Support agent" label="Agent name" onSave={onSave} />
        <button type="button">Delete</button>
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'Support agent' }));
    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), 'Ops');
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onSave).toHaveBeenCalledExactlyOnceWith('Ops');
    await act(async () => resolve());
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Ops' })).toBeInTheDocument();
  });

  it.each(['Control', 'Meta'])('multiline Enter inserts a newline and %s+Enter saves', async (modifier) => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<EditableText defaultValue="Description" label="Description" multiline maxLength={100} onSave={onSave} />);
    await user.click(screen.getByRole('button', { name: 'Description' }));
    const input = screen.getByRole('textbox');
    expect(input.tagName).toBe('TEXTAREA');
    expect(input).toHaveAttribute('maxlength', '100');
    await user.clear(input);
    await user.type(input, 'First{Enter}Second');
    expect(input).toHaveValue('First\nSecond');
    expect(onSave).not.toHaveBeenCalled();
    await user.keyboard(`{${modifier}>}{Enter}{/${modifier}}`);
    expect(onSave).toHaveBeenCalledExactlyOnceWith('First\nSecond');
    expect(screen.getByRole('button', { name: 'First\nSecond' })).toHaveFocus();
  });

  it('supports controlled value and editing with change requests', async () => {
    const user = userEvent.setup();
    const onEditingChange = vi.fn();
    function Controlled() {
      const [value, setValue] = useState('Support agent');
      const [editing, setEditing] = useState(false);
      return (
        <EditableText
          value={value}
          editing={editing}
          onEditingChange={(next) => {
            onEditingChange(next);
            setEditing(next);
          }}
          label="Agent name"
          onSave={(next) => setValue(next)}
        />
      );
    }
    render(<Controlled />);
    await user.click(screen.getByRole('button', { name: 'Support agent' }));
    expect(onEditingChange).toHaveBeenLastCalledWith(true);
    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), 'Ops{Enter}');
    expect(screen.getByRole('button', { name: 'Ops' })).toHaveFocus();
    expect(onEditingChange).toHaveBeenLastCalledWith(false);
  });

  it('respects externally controlled editing and opens with the latest value selected', () => {
    const onEditingChange = vi.fn();
    const { rerender } = render(
      <EditableText
        value="Support agent"
        editing={false}
        onEditingChange={onEditingChange}
        label="Agent name"
        onSave={() => {}}
      />,
    );
    rerender(
      <EditableText
        value="Billing agent"
        editing
        onEditingChange={onEditingChange}
        label="Agent name"
        onSave={() => {}}
      />,
    );
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input).toHaveValue('Billing agent');
    expect([input.selectionStart, input.selectionEnd]).toEqual([0, 13]);
    expect(input).toHaveFocus();
  });

  it('starts in defaultEditing mode', () => {
    render(<EditableText defaultValue="Support agent" defaultEditing label="Agent name" onSave={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveValue('Support agent');
    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it('disabled prevents pointer and keyboard activation', async () => {
    const user = userEvent.setup();
    render(<EditableText defaultValue="Support agent" label="Agent name" disabled onSave={() => {}} />);
    const preview = screen.getByRole('button', { name: 'Support agent' });
    expect(preview).toBeDisabled();
    await user.click(preview);
    await user.tab();
    await user.keyboard('{Enter}');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it.each(['dark', 'light', 'high_contrast'])('examples have no axe violations in %s', async (theme) => {
    document.documentElement.dataset.theme = theme;
    render(
      <>
        <PageTitle />
        <DoubleClick />
        <EditButton />
        <Multiline />
        <Controlled />
        <SaveStates />
        <LowLevel />
      </>,
    );
    await expectNoAxeViolations();
    delete document.documentElement.dataset.theme;
  });
  it('preserves focus when the user tabs away during an Enter-triggered save', async () => {
    const user = userEvent.setup();
    let resolve!: () => void;
    render(
      <>
        <EditableText
          defaultValue="Support agent"
          label="Agent name"
          onSave={() =>
            new Promise<void>((done) => {
              resolve = done;
            })
          }
        />
        <button type="button">Delete</button>
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'Support agent' }));
    await user.type(screen.getByRole('textbox'), 'x{Enter}');
    await user.tab();
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveFocus();
    await act(async () => resolve());
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveFocus();
  });

  it.each(['click', 'button'] as const)(
    'Space opens %s activation and Shift+Tab leaves the editor',
    async (activation) => {
      const user = userEvent.setup();
      render(
        <>
          <button type="button">Before</button>
          <EditableText defaultValue="Support agent" label="Agent name" activation={activation} onSave={() => true} />
        </>,
      );
      await user.tab();
      await user.tab();
      await user.keyboard(' ');
      expect(screen.getByRole('textbox')).toHaveFocus();
      await user.tab({ shift: true });
      expect(screen.getByRole('button', { name: 'Before' })).toHaveFocus();
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    },
  );

  it('returns focus to a rejected field after a blur save', async () => {
    const user = userEvent.setup();
    render(
      <>
        <EditableText defaultValue="Support agent" label="Agent name" onSave={() => 'Name already taken'} />
        <button type="button">Delete</button>
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'Support agent' }));
    await user.type(screen.getByRole('textbox'), 'x');
    await user.tab();
    expect(screen.getByRole('alert')).toHaveTextContent('Name already taken');
    expect(screen.getByRole('textbox')).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: 'Support agent' })).toHaveFocus();
  });
});
