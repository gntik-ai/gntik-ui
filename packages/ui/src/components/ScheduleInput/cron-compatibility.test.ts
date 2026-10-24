import { nextRuns } from './cron';

it('preserves native local cron behavior when a whole calendar day is skipped', () => {
  vi.stubEnv('TZ', 'Pacific/Apia');
  try {
    // Apia skipped Friday 30 December 2011. The original local Date constructor
    // shifts that Friday's run to Saturday (09:00 +14), rather than skipping a week.
    expect(nextRuns('0 9 * * 5', new Date('2011-12-29T12:00:00Z'), 1)[0]?.toISOString()).toBe(
      '2011-12-30T19:00:00.000Z',
    );
  } finally {
    vi.unstubAllEnvs();
  }
});
