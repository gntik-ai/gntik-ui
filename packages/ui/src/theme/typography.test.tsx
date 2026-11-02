import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { CodeBlock } from '../components/CodeBlock/CodeBlock';
import { JsonViewer } from '../components/JsonViewer/JsonViewer';
import { Terminal } from '../components/Terminal/Terminal';
import { Separator } from '../components/Separator/Separator';

it('code comments, JSON null and ANSI italics use palette emphasis', () => {
  render(
    <>
      <CodeBlock code="// Palette comment" language="typescript" />
      <JsonViewer data={{ empty: null }} />
      <Terminal lines={['\u001b[3mANSI emphasis\u001b[0m']} toolbar={false} />
    </>,
  );
  for (const text of ['// Palette comment', 'null', 'ANSI emphasis']) {
    expect(screen.getByText(text)).toHaveClass('font-emphasis');
  }
});

it('kicker labels allow palettes to select sentence case', () => {
  render(<Separator labelStyle="kicker" label="Members" />);
  expect(screen.getByText('Members')).toHaveClass('label-case');
});
