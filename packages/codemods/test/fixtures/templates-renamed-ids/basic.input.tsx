import { FlowBuilderPage, MfaChallengePage, flowBuilderTemplateMeta, type FlowBuilderPageProps } from '@gntik-ai/templates';
import { mfaChallengeTemplateMeta as mfaMeta } from '@gntik-ai/templates';

const pages = { FlowBuilderPage, mfa: MfaChallengePage };
const title: string = flowBuilderTemplateMeta.title;

export function Routes(props: FlowBuilderPageProps) {
  return (
    <>
      <FlowBuilderPage {...props} />
      <MfaChallengePage />
      <p>{mfaMeta.id} {title} {Object.keys(pages).length}</p>
    </>
  );
}
