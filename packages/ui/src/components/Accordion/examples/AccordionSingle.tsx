import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from '../Accordion';

const FAQ = [
  ['billing', 'How is usage billed?', 'Usage is metered per project and billed monthly. You can set a spending limit in the billing settings.'],
  ['members', 'Can I invite people outside my organization?', 'Yes. Guests get access to the projects you share with them and nothing else.'],
  ['deployments', 'How do I roll back a deployment?', 'Open the deployment, choose an earlier version and promote it. Traffic switches within a minute.'],
] as const;

export default function AccordionSingle() {
  return (
    <Accordion variant="card" defaultValue={['billing']} className="max-w-xl">
      {FAQ.map(([value, question, answer]) => (
        <AccordionItem key={value} value={value}>
          <AccordionTrigger>{question}</AccordionTrigger>
          <AccordionPanel>{answer}</AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
