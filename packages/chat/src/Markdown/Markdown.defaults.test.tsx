import { render } from '@testing-library/react';
import { expect, it } from 'vitest';
import { Markdown } from './Markdown';

// Snapshot captured from the immutable pre-extension renderer at 51a42eda.
const source =
  '# Heading\n\nA **bold** word and [local link](/docs).\n\n> Quote\n\n| Name | Count |\n| --- | --- |\n| Item | 1 |\n\n- [x] Done\n- [ ] Pending\n\n```ts\nconst ready = true;\n```\n\nPress <kbd>Ctrl</kbd>.\n\n<b>Hidden tag</b>';

it('keeps the default DOM unchanged from the pre-extension renderer', () => {
  const { container } = render(<Markdown>{source}</Markdown>);
  expect(container.innerHTML).toMatchInlineSnapshot(`
    "<div class="min-w-0 text-[14px] leading-[1.7] text-foreground [overflow-wrap:anywhere] [&amp;>:first-child]:mt-0 [&amp;>:last-child]:mb-0"><h1 class="mt-5 mb-2 text-[18px] font-semibold tracking-tight">Heading</h1>
    <p class="my-2.5">A <strong>bold</strong> word and <a href="/docs" class="rounded-sm font-medium text-primary-text underline decoration-primary/40 underline-offset-2 hover:decoration-primary focus-ring">local link</a>.</p>
    <blockquote class="my-3 border-s-2 border-primary/50 ps-3.5 text-muted-foreground">
    <p class="my-2.5">Quote</p>
    </blockquote>
    <div class="my-3 overflow-x-auto rounded-lg border border-border"><table class="w-full border-collapse text-start text-[13px]"><thead><tr><th class="border-b border-border bg-secondary/50 px-3 py-2 font-semibold">Name</th><th class="border-b border-border bg-secondary/50 px-3 py-2 font-semibold">Count</th></tr></thead><tbody><tr><td class="border-b border-border px-3 py-2 align-top [tr:last-child_&amp;]:border-b-0">Item</td><td class="border-b border-border px-3 py-2 align-top [tr:last-child_&amp;]:border-b-0">1</td></tr></tbody></table></div>
    <ul class="my-2.5 list-disc space-y-1 marker:text-muted-foreground ps-1">
    <li class="ps-1 [&amp;>ul]:my-1 [&amp;>ol]:my-1 [&amp;.task-list-item]:list-none [&amp;.task-list-item]:-ms-5 task-list-item"><input readonly="" disabled="" aria-label="Done" class="me-1.5 align-[-2px] accent-primary" type="checkbox" checked=""> Done</li>
    <li class="ps-1 [&amp;>ul]:my-1 [&amp;>ol]:my-1 [&amp;.task-list-item]:list-none [&amp;.task-list-item]:-ms-5 task-list-item"><input readonly="" disabled="" aria-label="Not done" class="me-1.5 align-[-2px] accent-primary" type="checkbox"> Pending</li>
    </ul>
    <div class="my-3 overflow-hidden rounded-lg border border-border bg-secondary/40" data-language="ts"><div class="flex h-9 items-center justify-between border-b border-border bg-secondary/50 ps-3 pe-1.5"><span class="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">ts</span><button type="button" tabindex="0" aria-label="Copy code" class="inline-flex shrink-0 items-center justify-center font-semibold whitespace-nowrap transition-colors select-none cursor-interactive focus-ring data-[disabled]:cursor-disabled data-[disabled]:opacity-50 text-muted-foreground not-data-[disabled]:hover:bg-secondary/70 not-data-[disabled]:hover:text-foreground gap-1.5 text-[12.5px] rounded-md h-7 px-2"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>Copy</button></div><pre class="overflow-x-auto p-3 font-mono text-[12.5px] leading-6"><code>const ready = true;</code></pre></div>
    <p class="my-2.5">Press Ctrl.</p>
    <p class="my-2.5">Hidden tag</p></div>"
  `);
});
