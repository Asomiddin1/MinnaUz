import { HttpException, HttpStatus } from '@nestjs/common';

// Native import is required: the published SDK is ESM, while Nest emits CJS.
const loadSdk = () => import('@tinkerlandai/longplay-sdk/server');

export async function requireKaiwaAccess(
  userId: string | undefined,
  env: Record<string, string | undefined> = process.env,
  loadClient = loadSdk,
): Promise<void> {
  if (!env.LONGPLAY_KAIWA_FEATURE_ID) return;
  if (!userId)
    throw new HttpException(
      'Sign in to use premium Kaiwa.',
      HttpStatus.UNAUTHORIZED,
    );
  let allowed: boolean;
  try {
    if (
      !env.LONGPLAY_BASE_URL ||
      !env.LONGPLAY_SECRET_KEY ||
      !env.LONGPLAY_APP_ID ||
      !['sandbox', 'live'].includes(env.LONGPLAY_ENVIRONMENT ?? '')
    )
      throw new Error('Configuration missing');
    const { createLongplayServer } = await loadClient();
    const client = createLongplayServer({
      baseUrl: env.LONGPLAY_BASE_URL,
      apiKey: env.LONGPLAY_SECRET_KEY,
      scope: {
        projectId: env.LONGPLAY_APP_ID,
        environment: env.LONGPLAY_ENVIRONMENT as 'sandbox' | 'live',
      },
      timeoutMs: 3000,
    });
    const { customer } = await client.getOrCreateCustomer({
      externalUserId: `minnauz:user:${userId}`,
    });
    const { check } = await client.checkEntitlement({
      customerId: customer.id,
      requirement: {
        internal_feature_id: env.LONGPLAY_KAIWA_FEATURE_ID,
        quantity: '1',
        properties: {},
      },
    });
    if (check.kind !== 'access') throw new Error('Expected access Feature');
    allowed = check.allowed;
  } catch {
    throw new HttpException(
      'Could not verify Kaiwa access.',
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
  if (!allowed)
    throw new HttpException(
      'Your plan does not include Kaiwa.',
      HttpStatus.PAYMENT_REQUIRED,
    );
}
