import { isValidElement } from 'react';
import { Button as BaseButton } from '@base-ui/react/button';
import { useI18n } from '../../i18n';
import { Button } from '../Button/Button';
import { useFileDialog, type UseFileDialogOptions } from './useFileDialog';

export interface FileTriggerProps
  extends Omit<BaseButton.Props, 'className' | 'type' | 'onSelect'>, Omit<UseFileDialogOptions, 'onChange'> {
  className?: string;
  onSelect?: (files: File[]) => void;
}

/** Opens an attached, unnamed picker. Use render to supply a custom button. */
export function FileTrigger({
  accept,
  multiple,
  directory,
  capture,
  disabled,
  onSelect,
  onClick,
  render,
  nativeButton: nativeButtonProp,
  children,
  ...props
}: FileTriggerProps) {
  const { t } = useI18n();
  const { open } = useFileDialog({ accept, multiple, directory, capture, disabled, onChange: onSelect });
  const nativeButton =
    nativeButtonProp ??
    !(isValidElement(render) && typeof render.type === 'string' && render.type !== 'button' && render.type !== 'input');
  return (
    <BaseButton
      {...props}
      nativeButton={nativeButton}
      render={render ?? <Button variant="secondary" />}
      type={nativeButton ? 'button' : undefined}
      disabled={disabled}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) open(event);
      }}
    >
      {children ?? (render ? undefined : t(multiple ? 'fileInput.chooseMany' : 'fileInput.choose'))}
    </BaseButton>
  );
}
