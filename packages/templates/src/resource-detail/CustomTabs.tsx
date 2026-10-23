import { Tabs, TabsList, TabsPanel, TabsTab } from '@gntik-ai/ui';
import { useState, type ReactNode } from 'react';

export interface CustomTabsProps {
  tabs: { value: string; label: string; content: ReactNode }[];
  defaultTab?: string;
  onTabChange?: (tab: string) => void;
}

export function CustomTabs({ tabs, defaultTab, onTabChange, label }: CustomTabsProps & { label: string }) {
  const [selected, setSelected] = useState(defaultTab);
  const value = tabs.find((tab) => tab.value === selected)?.value ?? tabs[0]?.value ?? null;

  if (tabs.length === 0) return null;

  return (
    <Tabs
      value={value}
      onValueChange={(next) => {
        const tab = tabs.find((tab) => tab.value === next);
        if (tab) {
          setSelected(tab.value);
          onTabChange?.(tab.value);
        }
      }}
    >
      <TabsList aria-label={label}>
        {tabs.map((tab) => (
          <TabsTab key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTab>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsPanel key={tab.value} value={tab.value}>
          {tab.content}
        </TabsPanel>
      ))}
    </Tabs>
  );
}
