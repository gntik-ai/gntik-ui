import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { Lightbox } from './Lightbox';
import LightboxGallery from './examples/LightboxGallery';
import LightboxWithVideo from './examples/LightboxWithVideo';
import { media } from './examples/media';

async function openGallery(at = 0) {
  const user = userEvent.setup();
  render(<LightboxGallery />);
  const opener = screen.getByRole('button', { name: `Open ${media[at]?.alt}` });
  opener.focus();
  await user.keyboard('{Enter}');
  const dialog = await screen.findByRole('dialog', { name: 'Media viewer' });
  return { user, opener, dialog };
}

const shown = () => within(screen.getByRole('dialog')).getAllByRole('img').find((img) => img.getAttribute('alt'));
const status = () => within(screen.getByRole('dialog')).getByRole('status');

describe('Lightbox', () => {
  it('opens at the chosen item with focus inside', async () => {
    const { dialog } = await openGallery(1);
    expect(shown()).toHaveAttribute('alt', media[1]?.alt);
    expect(status()).toHaveTextContent(`2 of 4: ${media[1]?.alt}`);
    expect(within(dialog).getByText('Usage · last 30 days').tagName).toBe('FIGCAPTION');
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
  });

  it('ArrowRight / ArrowLeft / Home / End navigate', async () => {
    const { user } = await openGallery();
    await user.keyboard('{ArrowRight}');
    expect(shown()).toHaveAttribute('alt', media[1]?.alt);
    await user.keyboard('{End}');
    expect(shown()).toHaveAttribute('alt', media[3]?.alt);
    await user.keyboard('{ArrowRight}');
    expect(shown()).toHaveAttribute('alt', media[3]?.alt);
    await user.keyboard('{ArrowLeft}');
    expect(shown()).toHaveAttribute('alt', media[2]?.alt);
    await user.keyboard('{Home}');
    expect(shown()).toHaveAttribute('alt', media[0]?.alt);
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
  });

  it('+ / - / 0 zoom the image', async () => {
    const { user, dialog } = await openGallery();
    const zoomOut = within(dialog).getByRole('button', { name: 'Zoom out' });
    expect(zoomOut).toBeDisabled();
    await user.keyboard('+');
    expect(within(dialog).getByText('150%')).toBeInTheDocument();
    expect(shown()).toHaveStyle({ height: '150%' });
    await user.keyboard('=');
    await user.keyboard('-');
    expect(within(dialog).getByText('150%')).toBeInTheDocument();
    await user.keyboard('0');
    expect(within(dialog).getByText('100%')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Zoom in' }));
    expect(within(dialog).getByText('150%')).toBeInTheDocument();
    await user.keyboard('{ArrowRight}');
    expect(within(dialog).getByText('100%')).toBeInTheDocument();
  });

  it('thumbnails: Tab to one and Enter shows it', async () => {
    const { user, dialog } = await openGallery();
    const thumbs = within(dialog).getByRole('group', { name: 'Thumbnails' });
    const third = within(thumbs).getByRole('button', { name: `Show 3: ${media[2]?.alt}` });
    third.focus();
    await user.keyboard('{Enter}');
    expect(third).toHaveAttribute('aria-current', 'true');
    expect(shown()).toHaveAttribute('alt', media[2]?.alt);
  });

  it('Tab stays inside; Escape closes and returns focus to the opener', async () => {
    const { user, dialog, opener } = await openGallery();
    for (let i = 0; i < 6; i++) {
      await user.tab();
      await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    }
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(opener).toHaveFocus());
  });

  it('videos render with controls and captions; loop wraps', async () => {
    const user = userEvent.setup();
    render(<LightboxWithVideo />);
    await user.click(screen.getByRole('button', { name: 'Watch walkthrough' }));
    const dialog = await screen.findByRole('dialog', { name: 'Onboarding media' });
    const video = dialog.querySelector('video');
    expect(video).toHaveAttribute('controls');
    expect(video?.querySelector('track[kind="captions"]')).toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: 'Zoom in' })).not.toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Previous' }));
    expect(status()).toHaveTextContent('3 of 3');
  });

  it('examples have no axe violations (open)', async () => {
    render(
      <>
        <LightboxGallery />
        <LightboxWithVideo />
      </>,
    );
    await expectNoAxeViolations();
    render(<Lightbox items={media} defaultOpen />);
    await screen.findByRole('dialog');
    await expectNoAxeViolations();
  });
});
