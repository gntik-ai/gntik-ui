import { FirstRunEmpty } from '../EmptyStates';

export default function HiddenAction() {
  return (
    <FirstRunEmpty
      title="No projects yet"
      description="Projects will appear here when they are available."
      actionLabel={null}
      secondary={null}
      steps={[]}
    />
  );
}
