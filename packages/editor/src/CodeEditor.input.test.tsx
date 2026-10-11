import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterAll, afterEach, beforeAll, expect, it, vi } from 'vitest';
import { CodeEditor } from './CodeEditor';
import type { Monaco } from './loader';

let monaco: Monaco;
const stylesheet = document.createElement('style');
beforeAll(async () => {
  monaco = await import('monaco-editor');
  // Load the same public stylesheets that consumers load, including Monaco's input layer.
  stylesheet.textContent = [
    'node_modules/monaco-editor/esm/vs/editor/browser/controller/editContext/textArea/textAreaEditContext.css',
    'src/styles.css',
  ]
    .map((file) => readFileSync(resolve(process.cwd(), file), 'utf8'))
    .join('\n');
  document.head.append(stylesheet);
}, 300000);

afterAll(() => stylesheet.remove());
afterEach(() => vi.unstubAllGlobals());

it('exposes a textarea textbox even when the browser supports native EditContext', async () => {
  // Only the browser API boundary is substituted; the editor and Monaco are real.
  class EditContext extends EventTarget {
    text = '';
    selectionStart = 0;
    selectionEnd = 0;
    updateText(start: number, end: number, text: string) {
      this.text = this.text.slice(0, start) + text + this.text.slice(end);
    }
    updateSelection(start: number, end: number) {
      this.selectionStart = start;
      this.selectionEnd = end;
    }
    updateControlBounds() {}
    updateSelectionBounds() {}
    updateCharacterBounds() {}
  }
  vi.stubGlobal('EditContext', EditContext);
  render(<CodeEditor defaultValue="count: wrong" aria-label="flow.yaml" loader={async () => monaco} />);
  const textbox = await screen.findByRole('textbox', { name: 'flow.yaml' });
  expect(textbox.tagName).toBe('TEXTAREA');
  expect(Number(getComputedStyle(textbox).zIndex)).toBeGreaterThan(0);
  textbox.focus();
  expect(textbox).toHaveFocus();
});
