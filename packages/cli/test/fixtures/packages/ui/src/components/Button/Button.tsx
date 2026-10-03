import { Button as BaseButton } from '@base-ui/react/button';
import { cn } from '../../utils/cn';
import { Spinner } from '../Spinner/Spinner';
import { buttonVariants, type ButtonVariantProps } from './button.variants';

export interface ButtonProps extends BaseButton.Props, ButtonVariantProps {
  loading?: boolean;
}

export function Button({ loading, variant, size, className, children, ...props }: ButtonProps) {
  return (
    <BaseButton className={cn(buttonVariants({ variant, size }), className)} aria-busy={loading || undefined} {...props}>
      {loading ? <Spinner size={14} /> : null}
      {children}
    </BaseButton>
  );
}

export function IconButton(props: ButtonProps) {
  return <Button size="icon" {...props} />;
}
