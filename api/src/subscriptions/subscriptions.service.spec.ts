import { NotFoundException } from '@nestjs/common';
import { SubscriptionStatus, PaymentStatus } from '@prisma/client';
import { SubscriptionsService } from './subscriptions.service';

describe('SubscriptionsService', () => {
  const prisma = {
    subscriptionPlan: { count: jest.fn(), createMany: jest.fn() },
    userSubscription: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    paymentTransaction: {
      findUnique: jest.fn(),
    },
  } as any;

  let service: SubscriptionsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SubscriptionsService(prisma);
  });

  it('keeps ACTIVE status when cancelling auto-renew', async () => {
    prisma.userSubscription.findFirst.mockResolvedValue({ id: 'sub-1' });
    prisma.userSubscription.update.mockResolvedValue({ id: 'sub-1' });

    const result = await service.cancelSubscription('user-1');

    expect(prisma.userSubscription.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'sub-1' },
        data: expect.objectContaining({
          autoRenew: false,
          status: SubscriptionStatus.ACTIVE,
        }),
      }),
    );
    expect(result.success).toBe(true);
  });

  it('throws when success callback transaction does not belong to user', async () => {
    prisma.paymentTransaction.findUnique.mockResolvedValue({
      id: 'tx-1',
      userId: 'user-2',
    });

    await expect(
      service.confirmPaymentSuccess('user-1', 'tx-1', 'ext-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns idempotent success when transaction is already completed', async () => {
    prisma.paymentTransaction.findUnique.mockResolvedValue({
      id: 'tx-1',
      userId: 'user-1',
      status: PaymentStatus.COMPLETED,
      metadata: null,
    });

    const result = await service.processPaymentSuccess('tx-1', 'ext-1');

    expect(result).toEqual({
      success: true,
      message: 'Ushbu toʻlov allaqachon qabul qilingan',
    });
  });
});
