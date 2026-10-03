import { TypingIndicator } from '../TypingIndicator';

export default function TypingIndicatorStates() {
  return (
    <div className="flex flex-col items-start gap-4">
      <TypingIndicator />
      <TypingIndicator showLabel />
      <TypingIndicator size="sm" author="Reviewer" showLabel />
    </div>
  );
}
