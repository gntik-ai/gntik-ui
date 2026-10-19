import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '@gntik-ai/ui';
import { expectNoAxeViolations } from '../test/a11y';
import AgentSurfaceForm from './examples/AgentSurfaceForm';
import { StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AgentSurface } from './AgentSurface';
import { defaultAgentCatalog, defineAgentCatalog } from './catalog';
import { A2UI_VERSION, type A2uiMessage } from './protocol';

const create: A2uiMessage = { version: A2UI_VERSION, createSurface: { surfaceId: 's1' } };
function components(items: Record<string, unknown>[]): A2uiMessage {
  return { version: A2UI_VERSION, updateComponents: { surfaceId: 's1', components: items } } as A2uiMessage;
}
const card = components([
  { id: 'root', component: 'Card', children: ['text', 'button'] },
  { id: 'text', component: 'Text', text: 'Hello' },
  { id: 'button', component: 'Button', label: 'Submit', action: { name: 'submit' } },
]);

describe('AgentSurface', () => {
  it('progressively renders kit components and patches a child without remounting its Card', () => {
    const { rerender } = render(<AgentSurface messages={[create]} catalog={defaultAgentCatalog} />);
    expect(screen.queryByText('Hello')).toBeNull();
    rerender(<AgentSurface messages={[create, card]} catalog={defaultAgentCatalog} />);
    const parent = screen.getByText('Hello').parentElement;
    expect(parent).toHaveClass('bg-card');
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    rerender(
      <AgentSurface
        messages={[create, card, components([{ id: 'text', component: 'Text', text: 'Updated' }])]}
        catalog={defaultAgentCatalog}
      />,
    );
    expect(screen.getByText('Updated').parentElement).toBe(parent);
  });
  it('rejects unknown types and invalid props with a neutral placeholder and one error', () => {
    const onError = vi.fn();
    const unknown = components([{ id: 'root', component: 'Iframe', src: 'https://example.com' }]);
    const { container, rerender } = render(
      <StrictMode>
        <AgentSurface messages={[create, unknown]} catalog={defaultAgentCatalog} onError={onError} />
      </StrictMode>,
    );
    expect(screen.getByText('This content cannot be shown')).toBeInTheDocument();
    expect(container.querySelector('iframe')).toBeNull();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ type: 'Iframe', surfaceId: 's1' }));
    rerender(
      <AgentSurface
        messages={[create, components([{ id: 'root', component: 'Text', text: 42 }])]}
        catalog={defaultAgentCatalog}
        onError={onError}
      />,
    );
    expect(screen.getByText('This content cannot be shown')).toBeInTheDocument();
    expect(onError).toHaveBeenLastCalledWith(expect.objectContaining({ code: 'props', type: 'Text' }));
  });
  it('drops agent styling, HTML and handlers; text is always a text node', () => {
    const { container } = render(
      <AgentSurface
        messages={[
          create,
          components([
            {
              id: 'root',
              component: 'Text',
              text: '<img src=x onerror=alert(1)>',
              className: 'agent-class',
              style: { position: 'fixed' },
              onClick: 'alert(1)',
              dangerouslySetInnerHTML: { __html: '<iframe />' },
            },
          ]),
        ]}
        catalog={defaultAgentCatalog}
      />,
    );
    expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeInTheDocument();
    expect(container.querySelector('img,iframe,.agent-class,[style],[onclick]')).toBeNull();
    expect(screen.getByRole('region', { name: 'Agent content' })).toHaveTextContent('Agent content');
  });

  it('binds Input and Text to the current model, supports keyboard submit and resolves action context once', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const model: A2uiMessage = {
      version: A2UI_VERSION,
      updateDataModel: { surfaceId: 's1', value: { user: { name: 'Ana' } } },
    };
    const form = components([
      { id: 'root', component: 'Card', children: ['name', 'echo', 'submit'] },
      { id: 'name', component: 'Input', label: 'Name', value: { path: '/user/name' } },
      { id: 'echo', component: 'Text', text: { path: '/user/name' } },
      {
        id: 'submit',
        component: 'Button',
        label: 'Submit',
        action: { name: 'submit', context: { name: { path: '/user/name' } } },
      },
    ]);
    const messages = [create, model, form];
    const { rerender } = render(<AgentSurface messages={messages} catalog={defaultAgentCatalog} onAction={onAction} />);
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Ana');
    await user.tab();
    await user.type(screen.getByRole('textbox'), ' López');
    expect(screen.getByText('Ana López')).toBeInTheDocument();
    await user.tab();
    await user.keyboard('{Enter}');
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith({ name: 'submit', surfaceId: 's1', context: { name: 'Ana López' } });
    const patch: A2uiMessage = {
      version: A2UI_VERSION,
      updateDataModel: { surfaceId: 's1', path: '/user/name', value: 'Bea' },
    };
    rerender(<AgentSurface messages={[...messages, patch]} catalog={defaultAgentCatalog} onAction={onAction} />);
    expect(screen.getByRole('textbox')).toHaveValue('Bea');
    expect(screen.getByText('Bea')).toBeInTheDocument();
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('rejects unsupported versions once per surface, including versions on later commands', () => {
    const onError = vi.fn();
    const unsupported = { ...create, version: 'v0.8' } as unknown as A2uiMessage;
    const { container, rerender } = render(
      <StrictMode>
        <AgentSurface
          messages={[unsupported, { ...card, version: 'v0.8' } as unknown as A2uiMessage]}
          catalog={defaultAgentCatalog}
          onError={onError}
        />
      </StrictMode>,
    );
    expect(container).toBeEmptyDOMElement();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith({ code: 'version', surfaceId: 's1' });
    rerender(
      <AgentSurface
        messages={[create, card, { ...card, version: 'v9' } as unknown as A2uiMessage]}
        catalog={defaultAgentCatalog}
        onError={onError}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
  it.each([
    null,
    { version: 'v0.9', updateComponents: { surfaceId: 's1', components: 'bad' } },
    { version: 'v0.9', createSurface: { surfaceId: 's1' }, deleteSurface: { surfaceId: 's1' } },
    {
      version: 'v0.9',
      updateComponents: { surfaceId: 's1', components: [{ id: 'root', component: 'Card', children: 'bad' }] },
    },
    {
      version: 'v0.9',
      updateComponents: { surfaceId: 's1', components: [{ id: 'root', component: 'Card', children: ['root'] }] },
    },
    {
      version: 'v0.9',
      updateComponents: {
        surfaceId: 's1',
        components: Array.from({ length: 257 }, (_, i) => ({ id: String(i), component: 'Card' })),
      },
    },
    { version: 'v0.9', updateDataModel: { surfaceId: 's1', path: '/__proto__/polluted', value: true } },
    {
      version: 'v0.9',
      updateDataModel: { surfaceId: 's1', value: JSON.parse('{"constructor":{"prototype":{"polluted":true}}}') },
    },
  ])('reports malformed or unsafe commands without throwing (%j)', (bad) => {
    const onError = vi.fn();
    expect(() =>
      render(
        <AgentSurface
          messages={[create, bad as unknown as A2uiMessage]}
          catalog={defaultAgentCatalog}
          onError={onError}
        />,
      ),
    ).not.toThrow();
    expect(onError).toHaveBeenCalled();
    expect(Object.hasOwn(Object.prototype, 'polluted')).toBe(false);
  });
  it('caps depth and rejects shared-child expansion, including disconnected cycles', () => {
    const onError = vi.fn();
    const deep = components(
      Array.from({ length: 34 }, (_, i) => ({
        id: i === 0 ? 'root' : String(i),
        component: 'Card',
        children: i < 33 ? [String(i + 1)] : [],
      })),
    );
    const { rerender } = render(
      <AgentSurface messages={[create, deep]} catalog={defaultAgentCatalog} onError={onError} />,
    );
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ code: 'graph' }));
    onError.mockClear();
    rerender(
      <AgentSurface
        messages={[
          create,
          components([
            { id: 'root', component: 'Card', children: ['a', 'b'] },
            { id: 'a', component: 'Card', children: ['leaf'] },
            { id: 'b', component: 'Card', children: ['leaf'] },
            { id: 'leaf', component: 'Text', text: 'Repeated' },
          ]),
        ]}
        catalog={defaultAgentCatalog}
        onError={onError}
      />,
    );
    expect(screen.queryByText('Repeated')).toBeNull();
    rerender(
      <AgentSurface
        messages={[create, components([{ id: 'orphan', component: 'Card', children: ['orphan'] }])]}
        catalog={defaultAgentCatalog}
        onError={onError}
      />,
    );
    expect(screen.getByText('This content cannot be shown')).toBeInTheDocument();
  });

  it.each(['javascript:alert(1)', 'java\tscript:alert(1)', '  java\nscript:alert(1)', 'data:text/html,bad'])(
    'drops unsafe URL %s, including URL bindings',
    (href) => {
      const { container } = render(
        <AgentSurface
          messages={[
            create,
            { version: A2UI_VERSION, updateDataModel: { surfaceId: 's1', value: { href } } },
            components([{ id: 'root', component: 'Text', text: 'Link', href: { path: '/href' } }]),
          ]}
          catalog={defaultAgentCatalog}
        />,
      );
      expect(screen.getByText('Link')).toBeInTheDocument();
      expect(container.querySelector('[href]')).toBeNull();
    },
  );
  it('allows safe links and sanitizes dangerous keys before a custom catalog receives them', () => {
    const catalog = defineAgentCatalog({
      ...defaultAgentCatalog,
      Custom: {
        validate: (props) => ({ ...props }),
        component: ({ props }) => (
          <a
            href={typeof props.href === 'string' ? props.href : undefined}
            className={typeof props.className === 'string' ? props.className : undefined}
          >
            {JSON.stringify(props)}
          </a>
        ),
      },
    });
    const { rerender, container } = render(
      <AgentSurface
        messages={[
          create,
          components([{ id: 'root', component: 'Text', text: 'Documentation', href: 'https://example.com/docs' }]),
        ]}
        catalog={catalog}
      />,
    );
    expect(screen.getByRole('link', { name: 'Documentation' })).toHaveAttribute('href', 'https://example.com/docs');
    rerender(
      <AgentSurface
        messages={[
          create,
          components([
            {
              id: 'root',
              component: 'Custom',
              href: 'javascript:alert(1)',
              className: 'bad',
              style: {},
              onClick: 'bad',
              dangerouslySetInnerHTML: { __html: '<b>bad</b>' },
            },
          ]),
        ]}
        catalog={catalog}
      />,
    );
    expect(container.querySelector('[href],.bad')).toBeNull();
    expect(container.textContent).not.toMatch(/className|style|onClick|dangerouslySetInnerHTML/);
  });
  it.each([
    { id: 'root', component: 'Input', label: 'Secret', type: 'password' },
    { id: 'root', component: 'Text', text: { path: '/constructor/name' } },
    { id: 'root', component: 'Button', label: 'Invalid', action: { name: 42 } },
    { id: 'root', component: 'Text', text: { path: 42 } },
  ])('rejects invalid bindings and action shapes, and password fields (%j)', (node) => {
    const onError = vi.fn();
    render(<AgentSurface messages={[create, components([node])]} catalog={defaultAgentCatalog} onError={onError} />);
    expect(screen.getByText('This content cannot be shown')).toBeInTheDocument();
    expect(onError).toHaveBeenCalledTimes(1);
  });
  it('contains errors from trusted custom validators and rejects inherited catalog entries', () => {
    const catalog = defineAgentCatalog({
      Broken: {
        component: () => null,
        validate: () => {
          throw new Error('Bad input');
        },
      },
    });
    const onError = vi.fn();
    const { rerender } = render(
      <AgentSurface
        messages={[create, components([{ id: 'root', component: 'Broken' }])]}
        catalog={catalog}
        onError={onError}
      />,
    );
    expect(screen.getByText('This content cannot be shown')).toBeInTheDocument();
    rerender(
      <AgentSurface
        messages={[create, components([{ id: 'root', component: 'toString' }])]}
        catalog={catalog}
        onError={onError}
      />,
    );
    expect(screen.getByText('This content cannot be shown')).toBeInTheDocument();
    expect(onError).toHaveBeenLastCalledWith(expect.objectContaining({ code: 'component', type: 'toString' }));
  });

  it.each(['sibling', 'composer', 'container'])(
    'unmounts a focused surface and restores focus to the %s',
    async (destination) => {
      const user = userEvent.setup();
      const remove: A2uiMessage = { version: A2UI_VERSION, deleteSurface: { surfaceId: 's1' } };
      const view = (messages: A2uiMessage[]) => (
        <>
          <AgentSurface messages={messages} catalog={defaultAgentCatalog} />
          {destination === 'sibling' && <button>Next</button>}
          {destination === 'composer' && <textarea aria-label="Message" />}
        </>
      );
      const { rerender } = render(view([create, card]));
      await user.click(screen.getByRole('button', { name: 'Submit' }));
      rerender(view([create, card, remove]));
      expect(screen.queryByRole('button', { name: 'Submit' })).toBeNull();
      expect(screen.queryByRole('region', { name: 'Agent content' })).toBeNull();
      if (destination === 'sibling') expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus();
      else if (destination === 'composer') expect(screen.getByRole('textbox', { name: 'Message' })).toHaveFocus();
      else expect(document.activeElement).not.toBe(document.body);
    },
  );
  it('does not move focus when deleting an unfocused surface', () => {
    const view = (messages: A2uiMessage[]) => (
      <>
        <AgentSurface messages={messages} catalog={defaultAgentCatalog} />
        <button>Next</button>
      </>
    );
    const { rerender } = render(view([create, card]));
    screen.getByRole('button', { name: 'Next' }).focus();
    rerender(view([create, card, { version: A2UI_VERSION, deleteSurface: { surfaceId: 's1' } }]));
    expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus();
  });

  it('renders every default kit entry and supports Select and Checkbox by keyboard', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <AgentSurface
        messages={[
          create,
          { version: A2UI_VERSION, updateDataModel: { surfaceId: 's1', value: { choice: 'a', checked: false } } },
          components([
            {
              id: 'root',
              component: 'Stack',
              direction: 'column',
              gap: 3,
              children: ['heading', 'badge', 'alert', 'select', 'check', 'submit'],
            },
            { id: 'heading', component: 'Heading', text: 'Preferences', level: 2 },
            { id: 'badge', component: 'Badge', text: 'Draft' },
            { id: 'alert', component: 'Alert', title: 'Review', text: 'Choose your preferences' },
            {
              id: 'select',
              component: 'Select',
              label: 'Choice',
              value: { path: '/choice' },
              options: [
                { value: 'a', label: 'First' },
                { value: 'b', label: 'Second' },
              ],
            },
            { id: 'check', component: 'Checkbox', label: 'Enable', checked: { path: '/checked' } },
            {
              id: 'submit',
              component: 'Button',
              label: 'Save',
              action: { name: 'save', context: { choice: { path: '/choice' }, checked: { path: '/checked' } } },
            },
          ]),
        ]}
        catalog={defaultAgentCatalog}
        onAction={onAction}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Preferences', level: 2 })).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Review' })).toHaveTextContent('Choose your preferences');
    await user.tab();
    expect(screen.getByRole('combobox', { name: 'Choice' })).toHaveFocus();
    await user.keyboard('{Enter}');
    await screen.findByRole('listbox');
    await user.keyboard('{ArrowDown}{Enter}');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    expect(screen.getByRole('combobox')).toHaveTextContent('Second');
    await user.tab();
    expect(screen.getByRole('checkbox', { name: 'Enable' })).toHaveFocus();
    await user.keyboard(' ');
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
    await user.tab();
    await user.keyboard(' ');
    expect(onAction).toHaveBeenCalledExactlyOnceWith({
      name: 'save',
      surfaceId: 's1',
      context: { choice: 'b', checked: true },
    });
  });

  it('submits the form from an Input with Enter exactly once', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <AgentSurface
        messages={[
          create,
          components([
            { id: 'root', component: 'Card', children: ['name', 'submit'] },
            { id: 'name', component: 'Input', label: 'Name', value: 'Ana' },
            { id: 'submit', component: 'Button', label: 'Submit', action: { name: 'submit' } },
          ]),
        ]}
        catalog={defaultAgentCatalog}
        onAction={onAction}
      />,
    );
    await user.click(screen.getByRole('textbox'));
    await user.keyboard('{Enter}');
    expect(onAction).toHaveBeenCalledExactlyOnceWith({ name: 'submit', surfaceId: 's1', context: {} });
  });

  it.each(['dark', 'light', 'high_contrast'])(
    'example is axe clean in %s, including open Select and the rejection state',
    async (theme) => {
      document.documentElement.className = theme;
      const user = userEvent.setup();
      const { container } = render(<AgentSurfaceForm />);
      await expectNoAxeViolations(container);
      await user.click(screen.getByRole('combobox'));
      await screen.findByRole('listbox');
      await expectNoAxeViolations(document.body);
      await user.keyboard('{Escape}');
      await user.click(screen.getByRole('button', { name: 'Show unsupported content' }));
      expect(screen.getByText('This content cannot be shown')).toBeInTheDocument();
      await expectNoAxeViolations(container);
    },
  );
  it('localizes the frame, rejection and form labels in Spanish', () => {
    render(
      <I18nProvider locale="es">
        <AgentSurfaceForm />
      </I18nProvider>,
    );
    expect(screen.getByRole('region', { name: 'Contenido del agente' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Nombre' })).toHaveValue('Ana');
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeInTheDocument();
  });
  it('recovers focus when deleting an open Select popup', async () => {
    const user = userEvent.setup();
    const options = components([
      {
        id: 'root',
        component: 'Select',
        label: 'Choice',
        options: [
          { value: 'a', label: 'First' },
          { value: 'b', label: 'Second' },
        ],
      },
    ]);
    const view = (messages: A2uiMessage[]) => (
      <>
        <AgentSurface messages={messages} catalog={defaultAgentCatalog} />
        <button>Next</button>
      </>
    );
    const { rerender } = render(view([create, options]));
    await user.tab();
    await user.keyboard('{Enter}{ArrowDown}');
    await screen.findByRole('listbox');
    rerender(view([create, options, { version: A2UI_VERSION, deleteSurface: { surfaceId: 's1' } }]));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus());
    expect(screen.queryByRole('listbox')).toBeNull();
  });
  it('enforces the component count across patches and keeps independent surfaces isolated', () => {
    const onError = vi.fn();
    const first = components(
      Array.from({ length: 200 }, (_, i) => ({ id: i === 0 ? 'root' : String(i), component: 'Text', text: 'First' })),
    );
    const rest = components(
      Array.from({ length: 57 }, (_, i) => ({ id: 'extra' + i, component: 'Text', text: 'Extra' })),
    );
    render(
      <AgentSurface
        messages={[
          create,
          first,
          rest,
          { version: A2UI_VERSION, createSurface: { surfaceId: 's2' } },
          {
            version: A2UI_VERSION,
            updateComponents: { surfaceId: 's2', components: [{ id: 'root', component: 'Text', text: 'Independent' }] },
          },
        ]}
        catalog={defaultAgentCatalog}
        onError={onError}
      />,
    );
    expect(screen.getByText('This content cannot be shown')).toBeInTheDocument();
    expect(screen.getByText('Independent')).toBeInTheDocument();
    expect(onError).toHaveBeenCalledWith({ code: 'graph', surfaceId: 's1' });
  });
  it('rejects cyclic object payloads and duplicate ids without throwing', () => {
    const cycle: Record<string, unknown> = {};
    cycle.self = cycle;
    const onError = vi.fn();
    render(
      <AgentSurface
        messages={[
          create,
          { version: A2UI_VERSION, updateDataModel: { surfaceId: 's1', value: cycle } },
          components([
            { id: 'root', component: 'Text', text: 'One' },
            { id: 'root', component: 'Text', text: 'Two' },
          ]),
        ]}
        catalog={defaultAgentCatalog}
        onError={onError}
      />,
    );
    expect(onError).toHaveBeenCalledWith({ code: 'message', surfaceId: 's1' });
    expect(screen.queryByText('One')).toBeNull();
    expect(screen.queryByText('Two')).toBeNull();
  });
  it('the example submits current values, shows disabled controls and resets them', async () => {
    const user = userEvent.setup();
    render(<AgentSurfaceForm />);
    await user.type(screen.getByRole('textbox', { name: 'Name' }), ' López');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(screen.getByText('Submitted for Ana López')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByRole('textbox')).toBeEnabled();
    expect(screen.getByRole('textbox')).toHaveValue('Ana');
  });
});
