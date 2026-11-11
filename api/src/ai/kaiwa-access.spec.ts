import { requireKaiwaAccess } from './kaiwa-access';
import { AiController } from './ai.controller';

const env = {
  LONGPLAY_KAIWA_FEATURE_ID: '11111111-1111-4111-8111-111111111111',
  LONGPLAY_APP_ID: 'app',
  LONGPLAY_BASE_URL: 'https://billing.invalid',
  LONGPLAY_SECRET_KEY: 'server-key',
  LONGPLAY_ENVIRONMENT: 'sandbox',
};

describe('Kaiwa access', () => {
  it('does not initialize billing by default; enabled deployments require an authenticated user', async () => {
    const neverLoad = () => {
      throw new Error('must not initialize');
    };
    await requireKaiwaAccess(undefined, {}, neverLoad);
    await expect(
      requireKaiwaAccess(undefined, env, neverLoad),
    ).rejects.toMatchObject({ status: 401 });
  });
  it('uses only the verified user ID and observes revoked access', async () => {
    let allowed = true;
    const fake = (() =>
      Promise.resolve({
        createLongplayServer: () => ({
          getOrCreateCustomer: (input: unknown) => {
            expect(input).toEqual({
              externalUserId: 'minnauz:user:verified-user',
            });
            return Promise.resolve({ customer: { id: 'customer' } });
          },
          checkEntitlement: () =>
            Promise.resolve({ check: { kind: 'access', allowed } }),
        }),
      })) as unknown as Parameters<typeof requireKaiwaAccess>[2];
    await requireKaiwaAccess('verified-user', env, fake);
    allowed = false;
    await expect(
      requireKaiwaAccess('verified-user', env, fake),
    ).rejects.toMatchObject({ status: 402 });
  });
  it('does not expose provider errors or accept credit checks', async () => {
    await expect(
      requireKaiwaAccess('u', env, () => {
        throw new Error('PRIVATE');
      }),
    ).rejects.toMatchObject({
      status: 503,
      message: 'Could not verify Kaiwa access.',
    });
    const fake = (() =>
      Promise.resolve({
        createLongplayServer: () => ({
          getOrCreateCustomer: () => Promise.resolve({ customer: { id: 'c' } }),
          checkEntitlement: () =>
            Promise.resolve({
              check: { kind: 'credit', allowed: true },
            }),
        }),
      })) as unknown as Parameters<typeof requireKaiwaAccess>[2];
    await expect(requireKaiwaAccess('u', env, fake)).rejects.toMatchObject({
      status: 503,
    });
  });
  it('does not invoke the real controller model path when authentication is missing', async () => {
    const previous = process.env.LONGPLAY_KAIWA_FEATURE_ID;
    process.env.LONGPLAY_KAIWA_FEATURE_ID = env.LONGPLAY_KAIWA_FEATURE_ID;
    const model = jest.fn();
    try {
      const controller = new AiController({ chatKaiwa: model } as never);
      await expect(
        controller.chatKaiwa({} as never, undefined),
      ).rejects.toMatchObject({ status: 401 });
      expect(model).not.toHaveBeenCalled();
    } finally {
      if (previous === undefined) delete process.env.LONGPLAY_KAIWA_FEATURE_ID;
      else process.env.LONGPLAY_KAIWA_FEATURE_ID = previous;
    }
  });
});
