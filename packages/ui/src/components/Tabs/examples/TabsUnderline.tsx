import { Tabs, TabsList, TabsPanel, TabsTab } from '../Tabs';

export default function TabsUnderline() {
  return (
    <Tabs defaultValue="overview">
      <TabsList aria-label="Project sections">
        <TabsTab value="overview">Overview</TabsTab>
        <TabsTab value="deployments" count={1284}>Deployments</TabsTab>
        <TabsTab value="members" count={3}>Members</TabsTab>
        <TabsTab value="logs">Logs</TabsTab>
        <TabsTab value="settings" disabled>Settings</TabsTab>
      </TabsList>
      <TabsPanel value="overview">Project health, recent activity and usage at a glance.</TabsPanel>
      <TabsPanel value="deployments">Every deployment, newest first.</TabsPanel>
      <TabsPanel value="members">People with access to this project.</TabsPanel>
      <TabsPanel value="logs">Streaming logs from the last 24 hours.</TabsPanel>
      <TabsPanel value="settings">Project settings.</TabsPanel>
    </Tabs>
  );
}
