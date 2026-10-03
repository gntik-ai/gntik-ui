export const promptDefaults = {
  system: 'You are a concise assistant for {{company}}. Answer in {{language}} and cite the source document when you use one.',
  user: 'Summarise the ticket below in three bullet points and suggest a next step.\n\n{{ticket}}',
  variables: {
    company: 'Northwind',
    language: 'English',
    ticket: '',
  } as Record<string, string>,
  temperature: 0.7,
  maxTokens: 1024,
};
