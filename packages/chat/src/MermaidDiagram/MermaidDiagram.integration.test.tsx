import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { MermaidDiagram } from './index';

it('contains the real Mermaid parse error for an invalid source', async () => {
  render(
    <>
      <MermaidDiagram code="graph TD; A-->" />
      <p>Sibling content</p>
    </>,
  );
  expect(await screen.findByText('Could not render the diagram', {}, { timeout: 10000 })).toBeVisible();
  expect(screen.getByText('graph TD; A-->')).toBeVisible();
  expect(screen.getByText('Sibling content')).toBeVisible();
});

// jsdom cannot lay out Mermaid: SVG getBBox and getComputedTextLength are absent.
// Real layout and contrast are exercised by the docs browser suites in PR CI.
it.skipIf(typeof SVGGraphicsElement.prototype.getBBox !== 'function')(
  'renders hostile sources with real Mermaid (requires browser SVG geometry)',
  async () => {
    render(<MermaidDiagram code={'graph TD; A["<img src=x onerror=alert(1)>"]-->B; click A call alert()'} />);
    const viewport = await screen.findByRole('region', { name: 'Diagram' }, { timeout: 10000 });
    expect(viewport.querySelector('svg')).not.toBeNull();
    expect(viewport.querySelector('script, foreignObject, [onerror], [onclick]')).toBeNull();
    for (const element of viewport.querySelectorAll('*')) {
      for (const attribute of element.attributes) {
        expect(attribute.name).not.toMatch(/^on/i);
        expect(attribute.value.replace(/\s/g, '')).not.toMatch(/javascript:/i);
      }
    }
  },
);
