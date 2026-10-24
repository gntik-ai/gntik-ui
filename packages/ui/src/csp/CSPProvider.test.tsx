import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { CSPProvider, SimpleSelect, Slider, Tabs, TabsList, TabsTab, TabsIndicator, useCSP } from '../index';

describe('CSPProvider', () => {
  it('passes the nonce to the Select scrollbar style', () => {
    render(
      <CSPProvider nonce="abc123">
        <SimpleSelect aria-label="Choice" defaultOpen items={[{ value: 'one', label: 'One' }]} />
      </CSPProvider>,
    );
    // React 19 hoists and deduplicates resource styles into the document head.
    expect(document.querySelector('style[data-href="base-ui-disable-scrollbar"]')).toHaveAttribute('nonce', 'abc123');
  });

  it('exposes defaults outside a provider and follows provider updates', () => {
    function Consumer() {
      const csp = useCSP();
      return <output data-testid="csp">{JSON.stringify(csp)}</output>;
    }
    const { rerender } = render(<Consumer />);
    expect(screen.getByTestId('csp')).toHaveTextContent('{"disableStyleElements":false}');
    rerender(
      <CSPProvider nonce="abc123">
        <Consumer />
      </CSPProvider>,
    );
    expect(screen.getByTestId('csp')).toHaveTextContent('{"nonce":"abc123","disableStyleElements":false}');
    rerender(
      <CSPProvider nonce="next" disableStyleElements>
        <Consumer />
      </CSPProvider>,
    );
    expect(screen.getByTestId('csp')).toHaveTextContent('{"nonce":"next","disableStyleElements":true}');
  });

  it.each(['tabs', 'slider'])(
    'nonces the server-rendered %s prehydration script without changing defaults',
    (component) => {
      const content =
        component === 'tabs' ? (
          <Tabs defaultValue="one">
            <TabsList indicator={false}>
              <TabsTab value="one">One</TabsTab>
              <TabsIndicator renderBeforeHydration />
            </TabsList>
          </Tabs>
        ) : (
          <Slider defaultValue={50} thumbAlignment="edge" aria-label="Value" />
        );
      const markup = renderToString(<CSPProvider nonce="abc123">{content}</CSPProvider>);
      expect(markup).toContain('<script nonce="abc123">');
      const defaults = renderToString(content);
      expect(defaults).toContain('<script>');
      expect(markup.replaceAll(' nonce="abc123"', '')).toBe(defaults);
    },
  );
});
