import { renderToString } from 'react-dom/server';
import { CSPProvider, PrintLayout } from '../../index';

describe('PrintLayout CSP', () => {
  it('applies the nonce to its page rule and preserves the default markup', () => {
    const page = (
      <PrintLayout size="letter" margin="wide">
        Body
      </PrintLayout>
    );
    const defaults = renderToString(page);
    expect(defaults).toContain('<style>@page { size: letter; margin: 28mm; }</style>');
    expect(defaults).not.toContain('nonce=');
    const markup = renderToString(<CSPProvider nonce="abc123">{page}</CSPProvider>);
    expect(markup).toContain('<style nonce="abc123">@page { size: letter; margin: 28mm; }</style>');
    expect(markup.replace(' nonce="abc123"', '')).toBe(defaults);
  });

  it.each([true, false])('omits the page rule with disableStyleElements=%s when pageRule is false', (disabled) => {
    expect(
      renderToString(
        <CSPProvider nonce="abc123" disableStyleElements={disabled}>
          <PrintLayout pageRule={false} />
        </CSPProvider>,
      ),
    ).not.toContain('<style');
  });

  it('omits an enabled page rule when style elements are disabled', () => {
    expect(
      renderToString(
        <CSPProvider disableStyleElements>
          <PrintLayout />
        </CSPProvider>,
      ),
    ).not.toContain('<style');
  });
});
