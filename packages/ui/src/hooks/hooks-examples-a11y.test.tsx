import { readdirSync } from 'node:fs';
import { cleanup, render } from '@testing-library/react';
import type { ComponentType } from 'react';
import { expectNoAxeViolations } from '../test/a11y';

const files = readdirSync(`${__dirname}/examples`).filter((file) => file.endsWith('.tsx'));
const examples = await Promise.all(
  files.map(async (file) => ({
    name: file.replace(/\.tsx$/, ''),
    Example: ((await import(`./examples/${file}`)) as { default: ComponentType }).default,
  })),
);

describe.each(['dark', 'light', 'high_contrast'])('hook examples in %s', (theme) => {
  afterEach(cleanup);

  it.each(examples)('$name has no axe violations', async ({ Example }) => {
    document.documentElement.className = theme;
    render(<Example />);
    await expectNoAxeViolations();
  });
});
