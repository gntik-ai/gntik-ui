import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative } from 'node:path';
import { renderToString } from 'react-dom/server';
import { CSPProvider, ScrollArea, SimpleSelect, Slider, Tabs, TabsIndicator, TabsList, TabsTab } from '../index';

it('inventories every Base UI inline element emitter and its consumers for upgrade review', () => {
  // Deliberately inspect the installed dependency here: this inventory is an upgrade alarm,
  // alongside behavioral tests at the kit's public seam, not an implementation assertion.
  const require = createRequire(import.meta.url);
  const root = dirname(require.resolve('@base-ui/react/package.json'));
  const files = readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.mjs'))
    .map((entry) => join(entry.parentPath, entry.name));
  const matching = (pattern: RegExp) =>
    files
      .filter((file) => pattern.test(readFileSync(file, 'utf8')))
      .map((file) => relative(root, file))
      .sort();
  expect(matching(/_jsx\("(?:style|script)"/)).toEqual(['internals/PrehydrationScript.mjs', 'utils/styles.mjs']);
  expect(matching(/import \{ PrehydrationScript \}/)).toEqual([
    'slider/thumb/SliderThumb.mjs',
    'tabs/indicator/TabsIndicator.mjs',
  ]);
  expect(matching(/import \{ styleDisableScrollbar \}/)).toEqual([
    'scroll-area/root/ScrollAreaRoot.mjs',
    'scroll-area/viewport/ScrollAreaViewport.mjs',
    'select/list/SelectList.mjs',
    'select/popup/SelectPopup.mjs',
  ]);
  const markup = renderToString(<ScrollArea>Content</ScrollArea>);
  const document = new DOMParser().parseFromString(markup, 'text/html');
  const styles = [...document.querySelectorAll('style')];
  expect(styles).toHaveLength(1);
  expect(styles[0]?.getAttribute('data-href')).toBe('base-ui-disable-scrollbar');
  expect(styles[0]?.textContent).toBe(
    '.base-ui-disable-scrollbar{scrollbar-width:none}.base-ui-disable-scrollbar::-webkit-scrollbar{display:none}',
  );
});

it.each(['scroll-area', 'select', 'tabs', 'slider'])(
  'keeps default %s server output without nonce attributes',
  (component) => {
    const content = {
      'scroll-area': <ScrollArea>Content</ScrollArea>,
      select: <SimpleSelect aria-label="Choice" defaultOpen items={[{ value: 'one', label: 'One' }]} />,
      tabs: (
        <Tabs defaultValue="one">
          <TabsList indicator={false}>
            <TabsTab value="one">One</TabsTab>
            <TabsIndicator renderBeforeHydration />
          </TabsList>
        </Tabs>
      ),
      slider: <Slider aria-label="Value" thumbAlignment="edge" defaultValue={50} />,
    }[component];
    const defaults = renderToString(content);
    expect(defaults).not.toContain('nonce=');
    expect(renderToString(<CSPProvider>{content}</CSPProvider>)).toBe(defaults);
  },
);
