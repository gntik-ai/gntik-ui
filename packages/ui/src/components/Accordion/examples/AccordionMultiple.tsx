import { useState } from 'react';
import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from '../Accordion';

export default function AccordionMultiple() {
  const [open, setOpen] = useState<string[]>(['general']);
  return (
    <Accordion multiple value={open} onValueChange={setOpen} className="max-w-xl">
      <AccordionItem value="general">
        <AccordionTrigger>General</AccordionTrigger>
        <AccordionPanel>Project name, description and default region.</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="notifications">
        <AccordionTrigger>Notifications</AccordionTrigger>
        <AccordionPanel>Choose who is notified when a deployment fails.</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="danger" disabled>
        <AccordionTrigger>Danger zone (owners only)</AccordionTrigger>
        <AccordionPanel>Transfer or delete the project.</AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
