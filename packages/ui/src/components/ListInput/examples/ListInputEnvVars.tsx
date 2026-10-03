import { ListInput } from '../ListInput';

const SECRET = /(SECRET|TOKEN|PASSWORD|KEY)$/;

export default function ListInputEnvVars() {
  return (
    <div className="flex max-w-2xl flex-col gap-2">
      <h3 className="text-[13px] font-semibold text-foreground">Environment variables</h3>
      <ListInput
        label="Environment variables"
        defaultValue={[
          { key: 'NODE_ENV', value: 'production' },
          { key: 'DATABASE_URL', value: 'postgres://db.internal:5432/app' },
          { key: 'STRIPE_SECRET', value: 'sk_live_51H8x' },
        ]}
        secret={(row) => SECRET.test(row.key)}
        validate={(row) => ({
          key: /^[A-Z_][A-Z0-9_]*$/.test(row.key) ? null : 'Use UPPER_SNAKE_CASE.',
          value: row.value ? null : 'A value is required.',
        })}
      />
    </div>
  );
}
