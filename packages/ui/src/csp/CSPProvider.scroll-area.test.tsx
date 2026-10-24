import { render } from '@testing-library/react';
import { CSPProvider, ScrollArea } from '../index';

// A separate document prevents Select's hoisted resource style from masking a missing nonce.
it('passes the nonce to the ScrollArea scrollbar style', () => {
  render(
    <CSPProvider nonce="abc123">
      <ScrollArea>Content</ScrollArea>
    </CSPProvider>,
  );
  expect(document.querySelector('style[data-href="base-ui-disable-scrollbar"]')).toHaveAttribute('nonce', 'abc123');
});
