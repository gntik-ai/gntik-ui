import type { FaqItem } from './Faq';

/** Sample product-agnostic questions. */
export const sampleFaqs: FaqItem[] = [
  { id: 'trial', question: 'Is there a free trial?', answer: 'Yes. Every paid plan starts with a 14-day trial, no card required. You can cancel at any time during the trial.' },
  { id: 'billing', question: 'How is usage billed?', answer: 'Usage is metered per project and billed monthly. You can set a spending limit and get alerts before you reach it.' },
  { id: 'plans', question: 'Can I change plans later?', answer: 'Upgrade or downgrade whenever you like. Changes are prorated to the day on your next invoice.' },
  { id: 'members', question: 'Can I invite people outside my organization?', answer: 'Yes. Guests only get access to the projects you share with them.' },
  { id: 'data', question: 'Where is my data stored?', answer: 'You choose the region when you create a project. Data stays in that region unless you move it.' },
];
