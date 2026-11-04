import { ForbiddenException } from '@nestjs/common';
import { Role } from '../auth/roles.enum';
import { UploadController } from './upload.controller';

describe('UploadController', () => {
  const storage = {
    getPublicUrl: jest.fn(),
    createPresignedDownloadUrl: jest.fn(),
  } as any;

  const prisma = {
    storedFile: {
      findUnique: jest.fn(),
    },
    userSubscription: {
      findFirst: jest.fn(),
    },
  } as any;

  const config = { get: jest.fn() } as any;

  let controller: UploadController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new UploadController(storage, prisma, config);
  });

  it('blocks regular user from offline materials without active Pro subscription', async () => {
    prisma.storedFile.findUnique.mockResolvedValue({
      id: 'file-1',
      visibility: 'PRIVATE',
      userId: 'teacher-1',
      category: 'documents',
      objectKey: 'documents/a.pdf',
    });
    prisma.userSubscription.findFirst.mockResolvedValue(null);

    await expect(
      controller.getFileDownloadUrl('file-1', { id: 'user-1', role: Role.USER }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows regular user with active Pro subscription to fetch offline material URL', async () => {
    prisma.storedFile.findUnique.mockResolvedValue({
      id: 'file-1',
      visibility: 'PRIVATE',
      userId: 'teacher-1',
      category: 'materials',
      objectKey: 'materials/a.zip',
    });
    prisma.userSubscription.findFirst.mockResolvedValue({ id: 'sub-1' });
    storage.createPresignedDownloadUrl.mockResolvedValue('https://signed-url');

    const result = await controller.getFileDownloadUrl('file-1', {
      id: 'user-1',
      role: Role.USER,
    });

    expect(result).toEqual(
      expect.objectContaining({
        success: true,
        url: 'https://signed-url',
        isPublic: false,
      }),
    );
  });
});
