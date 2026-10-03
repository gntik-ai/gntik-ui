import { sampleDeviceSessions, type DeviceSession } from '@gntik-ai/blocks';

export const sessions: DeviceSession[] = sampleDeviceSessions;

/** Demo verification code accepted by the MFA setup dialog. */
export const DEMO_MFA_CODE = '123456';

/** Shown in the setup dialog for manual entry (the QR code comes from your auth provider). */
export const mfaSetupKey = 'JBSW Y3DP EHPK 3PXP';

export const PASSWORD_MIN_LENGTH = 12;
