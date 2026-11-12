import { useMemo, type HTMLAttributes } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { Button } from '../Button/Button';
import { Spinner } from '../Spinner/Spinner';
import { qrCodeVariants } from './qr-code.variants';
import { QrCapacityError, encodeQr, type QrErrorLevel } from './qr-encoder';
import { QR_DEFAULT_LEVEL, QR_DEFAULT_MARGIN, QR_DEFAULT_SIZE, qrMargin, qrModulePath } from './qr-svg';

export type QrCodeStatus = 'active' | 'loading' | 'expired';

export interface QrCodeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className'> {
  /** Text to encode, as UTF-8 bytes (an otpauth URI, a pairing or share link). */
  value: string;
  /** Rendered width and height in px. Default 160. */
  size?: number;
  /** Error correction level: L, M, Q or H (about 7, 15, 25 and 30% recoverable). Default `M`. */
  errorLevel?: QrErrorLevel;
  /** Quiet zone in modules on every side. Scanners need 4; less is at the reader's mercy. Default 4. */
  margin?: number;
  /** Accessible name of the image. Default: the catalog "QR code". */
  label?: string;
  /** `loading` covers the code with a spinner; `expired` removes the modules and offers Refresh. */
  status?: QrCodeStatus;
  /** Shows a Refresh button on an expired code and runs when it is pressed. */
  onRefresh?: () => void;
  className?: string;
}

interface Drawing {
  /** Side of the viewBox, in modules, quiet zone included. */
  total: number;
  path: string;
}

/** Scannable QR code as one SVG path. Modules are always dark on a light surface, in every theme. */
export function QrCode({
  value,
  size = QR_DEFAULT_SIZE,
  errorLevel = QR_DEFAULT_LEVEL,
  margin = QR_DEFAULT_MARGIN,
  label,
  status = 'active',
  onRefresh,
  className,
  ...props
}: QrCodeProps) {
  const { t } = useI18n();
  const quietZone = qrMargin(margin);
  const drawing = useMemo<Drawing | null>(() => {
    try {
      const matrix = encodeQr(value, errorLevel);
      return { total: matrix.size + quietZone * 2, path: qrModulePath(matrix, quietZone) };
    } catch (error) {
      if (error instanceof QrCapacityError) return null;
      throw error;
    }
  }, [value, errorLevel, quietZone]);
  const s = qrCodeVariants();
  const box = { width: size, height: size };

  if (!drawing) {
    return (
      <div {...props} className={s.placeholder({ className })} style={{ ...props.style, ...box }}>
        {t('qrCode.tooLong')}
      </div>
    );
  }

  return (
    <div
      {...props}
      className={s.root({ className })}
      style={{ ...props.style, ...box }}
      aria-busy={status === 'loading' ? true : undefined}
    >
      {status === 'active' && (
        <svg
          role="img"
          aria-label={label ?? t('qrCode.label')}
          width={size}
          height={size}
          viewBox={`0 0 ${drawing.total} ${drawing.total}`}
          shapeRendering="crispEdges"
          className={s.svg()}
        >
          <path d={drawing.path} />
        </svg>
      )}
      {status === 'loading' && (
        <div className={s.overlay()}>
          <Spinner size={24} label={t('qrCode.loading')} />
        </div>
      )}
      {status === 'expired' && (
        <div className={s.overlay()}>
          <span>{t('qrCode.expired')}</span>
          {onRefresh && (
            <Button variant="secondary" size="sm" onClick={onRefresh}>
              {t('qrCode.refresh')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
