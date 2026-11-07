// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { useFileDialog } from './useFileDialog';

it('works without document during SSR and returns an empty selection', () => {
  function Example() {
    const { files } = useFileDialog();
    return <output>{files.length}</output>;
  }
  expect(typeof document).toBe('undefined');
  expect(renderToString(<Example />)).toBe('<output>0</output>');
});
