import { WorkflowBuilderPage, MfaPage, workflowBuilderTemplateMeta, type FlowBuilderPageProps } from '@gntik-ai/templates';
import { mfaTemplateMeta as mfaMeta } from '@gntik-ai/templates';

const pages = { FlowBuilderPage: WorkflowBuilderPage, mfa: MfaPage };
const title: string = workflowBuilderTemplateMeta.title;

export function Routes(props: FlowBuilderPageProps) {
  return (
    <>
      <WorkflowBuilderPage {...props} />
      <MfaPage />
      <p>{mfaMeta.id} {title} {Object.keys(pages).length}</p>
    </>
  );
}
