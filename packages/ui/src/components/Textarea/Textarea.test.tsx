import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { expectNoAxeViolations } from '../../test/a11y';
import { Field, FieldDescription, FieldError, FieldLabel } from '../Field';
import { Textarea } from './Textarea';
import TextareaAutosize from './examples/TextareaAutosize';
import TextareaAutosizeBounded from './examples/TextareaAutosizeBounded';
import TextareaCounter from './examples/TextareaCounter';

describe('Textarea', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('takes focus with Tab and leaves with Tab', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Textarea aria-label="Note" />
        <button type="button">After</button>
      </>,
    );
    await user.tab();
    expect(screen.getByRole('textbox', { name: 'Note' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });

  it('inserts a new line on Enter instead of submitting', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    const onValueChange = vi.fn();
    render(
      <form onSubmit={onSubmit}>
        <Textarea aria-label="Note" onValueChange={onValueChange} />
      </form>,
    );
    const ta = screen.getByRole('textbox', { name: 'Note' });
    expect(ta.tagName).toBe('TEXTAREA');
    await user.click(ta);
    await user.keyboard('one{Enter}two');
    expect(ta).toHaveValue('one\ntwo');
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onValueChange).toHaveBeenLastCalledWith('one\ntwo');
  });

  it('is labelled and described by its Field, focuses from the label and reflects invalid', async () => {
    const user = userEvent.setup();
    render(
      <Field invalid>
        <FieldLabel>Description</FieldLabel>
        <Textarea />
        <FieldDescription>Shown on the project page.</FieldDescription>
        <FieldError match>Too long.</FieldError>
      </Field>,
    );
    await user.click(screen.getByText('Description'));
    const ta = screen.getByRole('textbox', { name: 'Description' });
    expect(ta).toHaveFocus();
    expect(ta).toHaveAccessibleDescription(/Shown on the project page\./);
    expect(ta).toHaveAccessibleDescription(/Too long\./);
    expect(ta).toHaveAttribute('data-invalid');
  });

  it('forwards the ref, applies autosize and rows', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(
      <>
        <Textarea ref={ref} aria-label="Fixed" rows={6} />
        <Textarea aria-label="Auto" autosize />
      </>,
    );
    expect(ref.current).toBe(screen.getByRole('textbox', { name: 'Fixed' }));
    expect(ref.current).toHaveAttribute('rows', '6');
    expect(screen.getByRole('textbox', { name: 'Auto' })).toHaveClass('field-sizing-content');
  });

  it('applies row bounds only to autosize and preserves consumer styles', () => {
    vi.stubGlobal('CSS', { supports: () => true });
    const { rerender } = render(
      <Textarea aria-label="Prompt" autosize minRows={2} maxRows={6} style={{ marginTop: 8 }} />,
    );
    const field = screen.getByRole('textbox');
    expect(field.style.getPropertyValue('--textarea-min-rows')).toBe('2');
    expect(field.style.getPropertyValue('--textarea-max-rows')).toBe('6');
    expect(field.style.marginTop).toBe('8px');
    expect(field.style.height).toBe('');
    expect(field).not.toHaveClass('min-h-[88px]');
    expect(field.className).toContain('min-h-[calc(var(--textarea-min-rows)*1lh+1rem+2px)]');
    expect(field.className).toContain('max-h-[calc(var(--textarea-max-rows)*1lh+1rem+2px)]');
    expect(field).toHaveClass('overflow-y-auto');

    rerender(<Textarea aria-label="Prompt" minRows={2} maxRows={6} rows={5} />);
    expect(field).toHaveAttribute('rows', '5');
    expect(field.style.getPropertyValue('--textarea-min-rows')).toBe('');
    expect(field.style.getPropertyValue('--textarea-max-rows')).toBe('');
    expect(field.className).not.toContain('--textarea-');
    expect(field).not.toHaveClass('overflow-y-auto');
    vi.unstubAllGlobals();
  });

  it('grows and shrinks uncontrolled content without field-sizing, with the caret visible', async () => {
    vi.stubGlobal('CSS', { supports: () => false });
    const computedStyle = window.getComputedStyle.bind(window);
    vi.spyOn(window, 'getComputedStyle').mockImplementation((element) => {
      const style =
        element instanceof HTMLTextAreaElement ? document.createElement('div').style : computedStyle(element);
      if (element instanceof HTMLTextAreaElement) {
        Object.assign(style, {
          lineHeight: '24px',
          paddingTop: '8px',
          paddingBottom: '8px',
          borderTopWidth: '1px',
          borderBottomWidth: '1px',
        });
      }
      return style;
    });
    vi.spyOn(HTMLTextAreaElement.prototype, 'scrollHeight', 'get').mockImplementation(function (
      this: HTMLTextAreaElement,
    ) {
      return this.value.split('\n').length * 24 + 16;
    });
    const user = userEvent.setup();
    render(<Textarea aria-label="Prompt" autosize minRows={2} maxRows={6} />);
    const field = screen.getByRole<HTMLTextAreaElement>('textbox');
    expect(field.style.height).toBe('66px');
    await user.click(field);
    await user.keyboard('one{Enter}two{Enter}three{Enter}four');
    expect(field.style.height).toBe('114px');
    expect(field.style.overflowY).toBe('hidden');
    await user.keyboard('{Enter}five{Enter}six{Enter}seven{Enter}eight{Enter}nine{Enter}ten');
    expect(field.style.height).toBe('162px');
    expect(field.style.overflowY).toBe('auto');
    expect(field.scrollTop).toBeGreaterThan(0);
    fireEvent.change(field, { target: { value: 'one' } });
    expect(field.style.height).toBe('66px');
    expect(field.style.overflowY).toBe('hidden');
  });

  it('resizes controlled replacements and uses each size computed metrics', () => {
    vi.stubGlobal('CSS', { supports: () => false });
    const { rerender } = render(<Textarea aria-label="Prompt" autosize size="sm" minRows={2} maxRows={6} value="" />);
    const field = screen.getByRole<HTMLTextAreaElement>('textbox');
    const computedStyle = window.getComputedStyle.bind(window);
    vi.spyOn(window, 'getComputedStyle').mockImplementation((element) => {
      if (element !== field) return computedStyle(element);
      const style = document.createElement('div').style;
      Object.assign(style, {
        lineHeight: '20px',
        paddingTop: '8px',
        paddingBottom: '8px',
        borderTopWidth: '1px',
        borderBottomWidth: '1px',
      });
      return style;
    });
    vi.spyOn(field, 'scrollHeight', 'get').mockReturnValue(416);
    rerender(
      <Textarea
        aria-label="Prompt"
        autosize
        size="sm"
        minRows={2}
        maxRows={6}
        value={Array(20).fill('line').join('\n')}
      />,
    );
    expect(field.style.height).toBe('138px');
    vi.spyOn(field, 'scrollHeight', 'get').mockReturnValue(36);
    rerender(<Textarea aria-label="Prompt" autosize size="sm" minRows={2} maxRows={6} value="one" />);
    expect(field.style.height).toBe('58px');
    rerender(<Textarea aria-label="Prompt" size="sm" rows={5} value="one" />);
    expect(field.style.height).toBe('');
    expect(field.style.overflowY).toBe('');
    expect(field).toHaveAttribute('rows', '5');
  });

  it('leaves native unbounded autosize unchanged and ignores invalid bounds', () => {
    vi.stubGlobal('CSS', { supports: () => true });
    const { rerender } = render(<Textarea aria-label="Prompt" autosize />);
    const field = screen.getByRole<HTMLTextAreaElement>('textbox');
    const originalClasses = field.className;
    expect(field).toHaveClass('field-sizing-content', 'min-h-[88px]', 'resize-none');
    expect(field).not.toHaveAttribute('rows');
    expect(field.style.height).toBe('');
    expect(field.style.cssText).not.toContain('--textarea-');
    for (const invalid of [0, -1, NaN, Infinity, -Infinity]) {
      rerender(<Textarea aria-label="Prompt" autosize minRows={invalid} maxRows={invalid} />);
      expect(field.className).toBe(originalClasses);
      expect(field.style.cssText).toBe('');
    }
    rerender(
      <Textarea aria-label="Prompt" autosize minRows={8} maxRows={2} value={Array(20).fill('line').join('\n')} />,
    );
    expect(field.style.getPropertyValue('--textarea-min-rows')).toBe('2');
    expect(field.style.getPropertyValue('--textarea-max-rows')).toBe('2');
    expect(field.style.height).toBe('');
    rerender(<Textarea aria-label="Prompt" autosize maxRows={6} />);
    expect(field).toHaveClass('min-h-[88px]');
    expect(field.style.getPropertyValue('--textarea-min-rows')).toBe('');
    rerender(<Textarea aria-label="Prompt" autosize minRows={2} />);
    expect(field.style.getPropertyValue('--textarea-max-rows')).toBe('');
    expect(field).not.toHaveClass('overflow-y-auto');
  });

  describe('native autosize scroll', () => {
    const scrollGeometry = (scrollHeight: number, clientHeight: number) => {
      vi.stubGlobal('CSS', { supports: () => true });
      vi.spyOn(HTMLTextAreaElement.prototype, 'scrollHeight', 'get').mockReturnValue(scrollHeight);
      vi.spyOn(HTMLTextAreaElement.prototype, 'clientHeight', 'get').mockReturnValue(clientHeight);
    };
    const text = Array(12).fill('line').join('\n');

    it('scrolls a capped field to its end when typing with the caret at the end', async () => {
      scrollGeometry(255, 160);
      const user = userEvent.setup();
      render(<Textarea aria-label="Prompt" autosize minRows={2} maxRows={6} />);
      const field = screen.getByRole<HTMLTextAreaElement>('textbox');
      await user.click(field);
      await user.keyboard(text.replaceAll('\n', '{Enter}'));
      expect(field.scrollTop + field.clientHeight).toBeGreaterThanOrEqual(field.scrollHeight - 1);
      expect(field.style.height).toBe('');
      expect(field.style.overflowY).toBe('');
    });

    it('leaves the scroll position alone when the caret is in the middle', async () => {
      scrollGeometry(255, 160);
      const user = userEvent.setup();
      render(<Textarea aria-label="Prompt" autosize minRows={2} maxRows={6} defaultValue={text} />);
      const field = screen.getByRole<HTMLTextAreaElement>('textbox');
      await user.click(field);
      field.scrollTop = 40;
      field.setSelectionRange(10, 10);
      await user.keyboard('x');
      expect(field.value).toHaveLength(text.length + 1);
      expect(field.scrollTop).toBe(40);
    });

    it('does not scroll or set a height when the content does not overflow', async () => {
      scrollGeometry(100, 100);
      const user = userEvent.setup();
      render(<Textarea aria-label="Prompt" autosize minRows={2} maxRows={6} />);
      const field = screen.getByRole<HTMLTextAreaElement>('textbox');
      await user.click(field);
      await user.keyboard('one');
      expect(field.scrollTop).toBe(0);
      expect(field.style.height).toBe('');
    });
  });

  it('keeps an 88px minimum with missing CSS.supports and zero scrollHeight', () => {
    vi.stubGlobal('CSS', {});
    const { rerender } = render(<Textarea aria-label="Prompt" autosize />);
    const field = screen.getByRole<HTMLTextAreaElement>('textbox');
    expect(field.style.height).toBe('88px');
    vi.spyOn(field, 'scrollHeight', 'get').mockReturnValue(500);
    rerender(<Textarea aria-label="Prompt" autosize value="long content" />);
    expect(field.style.height).toBe('500px');
  });

  it('keeps consumer height caps scrollable in the unbounded fallback', () => {
    vi.stubGlobal('CSS', { supports: () => false });
    vi.spyOn(HTMLTextAreaElement.prototype, 'scrollHeight', 'get').mockReturnValue(500);
    render(<Textarea aria-label="Prompt" autosize style={{ maxHeight: 220 }} />);
    const field = screen.getByRole<HTMLTextAreaElement>('textbox');
    expect(field.style.height).toBe('220px');
    expect(field.style.overflowY).toBe('auto');
  });

  it('examples have no axe violations', async () => {
    render(
      <>
        <TextareaAutosizeBounded />
        <TextareaCounter />
        <TextareaAutosize />
      </>,
    );
    await expectNoAxeViolations();
  });
});
