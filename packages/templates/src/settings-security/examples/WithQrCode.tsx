import SettingsSecurityPage from '../Page';
import { mfaOtpauthUri } from '../data';

/** Turn on the authenticator app: the setup dialog shows a QR code of the otpauth URI above the setup key. */
export default function WithQrCode() {
  return <SettingsSecurityPage mfaOtpauthUri={mfaOtpauthUri} />;
}
