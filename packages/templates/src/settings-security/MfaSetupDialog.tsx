import { Button, Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Field, FieldDescription, FieldError, FieldLabel, OtpInput, useI18n } from '@gntik-ai/ui';
import { useState } from 'react';

export interface MfaSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setupKey: string;
  /** Checks the 6-digit code; resolve `true` to finish enrolment. */
  onVerify: (code: string) => boolean | Promise<boolean>;
}

/** Authenticator enrolment: manual setup key and a 6-digit OtpInput, verified on completion. */
export function MfaSetupDialog({ open, onOpenChange, setupKey, onVerify }: MfaSetupDialogProps) {
  const { t } = useI18n();
  const [code, setCode] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [checking, setChecking] = useState(false);

  const change = (next: boolean) => {
    if (!next) {
      setCode('');
      setInvalid(false);
    }
    onOpenChange(next);
  };

  const verify = async (value: string) => {
    if (value.length < 6 || checking) return;
    setChecking(true);
    const ok = await onVerify(value);
    setChecking(false);
    if (ok) change(false);
    else setInvalid(true);
  };

  return (
    <Dialog open={open} onOpenChange={change}>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void verify(code);
          }}
        >
          <DialogHeader>
            <DialogTitle>Set up two-factor authentication</DialogTitle>
            <DialogDescription>Add this account to your authenticator app, then enter the code it shows.</DialogDescription>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-5">
            <p className="text-[12.5px] text-muted-foreground">
              Setup key: <span className="font-mono text-foreground">{setupKey}</span>
            </p>
            <Field invalid={invalid}>
              <FieldLabel>Verification code</FieldLabel>
              <OtpInput
                groupSize={3}
                value={code}
                onValueChange={(v) => {
                  setCode(v);
                  setInvalid(false);
                }}
                onComplete={(v) => void verify(v)}
              />
              <FieldDescription>Enter the 6-digit code from your authenticator app.</FieldDescription>
              <FieldError match={invalid}>That code is not valid. Try again.</FieldError>
            </Field>
          </DialogBody>
          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>{t('common.cancel')}</DialogClose>
            <Button type="submit" loading={checking} disabled={code.length < 6}>
              Verify and enable
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
