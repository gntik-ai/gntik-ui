import ContactPage from '../Page';

/** Submit the prefilled form to see safe failure feedback with every value preserved. */
export default function FailedSend() {
  return (
    <ContactPage
      defaultValues={{
        name: 'Ada Example',
        email: 'ada@example.com',
        company: 'Example Ltd',
        topic: 'sales',
        message: 'We would like a demo for 40 seats.',
      }}
      onSubmit={async () => {
        throw new Error();
      }}
    />
  );
}
