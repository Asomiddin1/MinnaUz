export type StorageCategory =
  'videos' | 'audio' | 'images' | 'avatars' | 'documents' | 'materials';

// Backward compatibility alias
export type StorageBucket = StorageCategory;

export interface PresignedUploadResult {
  uploadUrl: string;
  objectKey: string;
  publicUrl?: string;
  isPublic: boolean;
  expiresIn: number;
}

export interface IStorageService {
  upload(
    category: StorageCategory,
    filename: string,
    buffer: Buffer,
    mimetype: string,
  ): Promise<string>;

  delete(category: StorageCategory, objectKeyOrFilename: string): Promise<void>;

  getPublicUrl(objectKey: string): string;

  createPresignedUploadUrl(
    category: StorageCategory,
    originalFilename: string,
    mimetype: string,
    expiresIn?: number,
  ): Promise<PresignedUploadResult>;

  createPresignedDownloadUrl(
    objectKey: string,
    expiresIn?: number,
  ): Promise<string>;

  exists(objectKey: string): Promise<boolean>;

  extractFilename(urlOrKey: string, category?: StorageCategory): string | null;

  isPublicCategory(category: StorageCategory): boolean;
}

export const STORAGE_SERVICE = 'STORAGE_SERVICE';
