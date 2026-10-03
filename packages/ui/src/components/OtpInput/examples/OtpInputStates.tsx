import { OtpInput } from '../OtpInput';

export default function OtpInputStates() {
  return (
    <div className="flex flex-col gap-6">
      <OtpInput aria-label="Four-digit PIN" length={4} defaultValue="4821" />
      <OtpInput aria-label="Rejected code" invalid defaultValue="908172" />
      <OtpInput aria-label="Locked code" disabled defaultValue="55" />
    </div>
  );
}
