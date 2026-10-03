export const template = `import { HomeDashboardPage } from '@gntik-ai/templates';

// A whole page: console shell (sidebar + topbar) and the home dashboard, fed by fixtures.
// Without workspaces the sidebar shows the brand preset's logo: switch the brand above.
export default function App() {
  return <HomeDashboardPage title="Overview" shell={{ workspaces: null }} />;
}
`;
