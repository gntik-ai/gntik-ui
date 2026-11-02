import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { Markdown } from './Markdown/Markdown';
import { ModelPicker } from './ModelPicker/ModelPicker';

it('unavailable model reasons and blocked Markdown images follow palette emphasis', async () => {
  const user = userEvent.setup();
  render(
    <>
      <Markdown>{'![Preview](javascript:blocked)'}</Markdown>
      <ModelPicker
        value={null}
        onValueChange={() => {}}
        models={[{ id: 'test', name: 'Test model', provider: 'Local', disabled: true, disabledReason: 'Unavailable' }]}
      />
    </>,
  );
  expect(screen.getByText(/Image: Preview/)).toHaveClass('font-emphasis');
  await user.click(screen.getByRole('combobox'));
  expect(await screen.findByText('Unavailable')).toHaveClass('font-emphasis');
});
