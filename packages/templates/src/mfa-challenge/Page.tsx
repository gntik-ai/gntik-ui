import { MfaChallenge, type MfaMethod } from '@gntik-ai/blocks';
import { AuthLayout } from '@gntik-ai/ui';
import type { ReactNode } from 'react';
import { mfaChallengeSample } from './data';

export interface MfaChallengePageProps {
  /** Verifies the code. A returned promise shows the loading state; a rejection shows in the alert. */
  onVerify: (code: string, method: MfaMethod) => void | Promise<void>;
  /** Sends a new code. */
  onResend: () => void | Promise<void>;
  /** "Back to sign in". */
  onCancel: () => void;
  /** Where the code was sent; `null` for authenticator apps. */
  destination: string | null;
  resendCooldown: number;
  length: 6 | 8;
  error: string | null;
  logo: ReactNode;
}

/** Card second-factor step: AuthLayout `card` + MfaChallenge. */
export default function MfaChallengePage({
  onVerify,
  onResend = () => {},
  onCancel = () => {},
  destination = mfaChallengeSample.destination,
  resendCooldown = mfaChallengeSample.resendCooldown,
  length = mfaChallengeSample.length,
  error,
  logo,
}: Partial<MfaChallengePageProps>) {
  return (
    <AuthLayout fullScreen variant="card" logo={logo} skipLinkLabel="Skip to verification form">
      <MfaChallenge
        onVerify={onVerify}
        onResend={onResend}
        onCancel={onCancel}
        destination={destination ?? undefined}
        resendCooldown={resendCooldown}
        length={length}
        error={error}
      />
    </AuthLayout>
  );
}
