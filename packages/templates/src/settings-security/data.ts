import { sampleDeviceSessions, type DeviceSession } from '@gntik-ai/blocks';

export const sessions: DeviceSession[] = sampleDeviceSessions;

/** Demo verification code accepted by the MFA setup dialog. */
export const DEMO_MFA_CODE = '123456';

/** Shown in the setup dialog for manual entry, next to the QR code of `mfaOtpauthUri`. */
export const mfaSetupKey = 'JBSW Y3DP EHPK 3PXP';

/** The enrolment URI an auth provider returns: the QR code encodes it, and its secret is `mfaSetupKey` without spaces. */
export const mfaOtpauthUri = 'otpauth://totp/Example:ana@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example';

export const PASSWORD_MIN_LENGTH = 12;
