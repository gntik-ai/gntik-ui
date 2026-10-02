import { Activity, LineChart, Settings, ShieldCheck } from 'lucide-react';
import { Tabs, TabsList, TabsPanel, TabsTab } from '../Tabs';

export default function TabsWithIcons() {
  return (
    <Tabs defaultValue="activity">
      <TabsList aria-label="Workspace">
        <TabsTab value="activity" icon={Activity}>Activity</TabsTab>
        <TabsTab value="metrics" icon={LineChart}>Metrics</TabsTab>
        <TabsTab value="policies" icon={ShieldCheck}>Policies</TabsTab>
        <TabsTab value="settings" icon={Settings}>Settings</TabsTab>
      </TabsList>
      <TabsPanel value="activity">Recent events across all projects.</TabsPanel>
      <TabsPanel value="metrics">Requests, latency and error rate.</TabsPanel>
      <TabsPanel value="policies">Access and retention policies.</TabsPanel>
      <TabsPanel value="settings">Workspace settings.</TabsPanel>
    </Tabs>
  );
}
