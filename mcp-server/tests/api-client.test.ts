import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { MinnaUzApiClient, resolveApiPath } from '../src/services/api-client.js';

vi.mock('axios');

describe('MinnaUzApiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('resolveApiPath', () => {
    it('should strip duplicate leading /api if present', () => {
      expect(resolveApiPath('/api/courses')).toBe('/courses');
      expect(resolveApiPath('api/courses')).toBe('/courses');
      expect(resolveApiPath('/courses')).toBe('/courses');
      expect(resolveApiPath('courses')).toBe('/courses');
    });
  });

  describe('Error normalization and timeouts', () => {
    it('should normalize 401 Unauthorized errors cleanly', async () => {
      const mockGet = vi.fn().mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 401,
          data: { message: 'Token expired' },
        },
      });

      vi.mocked(axios.create).mockReturnValue({
        get: mockGet,
      } as any);

      const client = new MinnaUzApiClient('http://test-api/api', 5000);

      await expect(client.validateToken('invalid-token')).rejects.toThrow(
        'Authentication required for token validation: Token expired'
      );
    });

    it('should normalize 404 Not Found errors cleanly', async () => {
      const mockGet = vi.fn().mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 404,
          data: { message: 'Not found' },
        },
      });

      vi.mocked(axios.create).mockReturnValue({
        get: mockGet,
      } as any);

      const client = new MinnaUzApiClient('http://test-api/api', 5000);

      await expect(client.getCourseDetails('nonexistent')).rejects.toThrow(
        'Resource not found for fetching course details for nonexistent'
      );
    });

    it('should normalize timeout errors into user-friendly message', async () => {
      const mockGet = vi.fn().mockRejectedValue({
        isAxiosError: true,
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded',
      });

      vi.mocked(axios.create).mockReturnValue({
        get: mockGet,
      } as any);

      const client = new MinnaUzApiClient('http://test-api/api', 5000);

      await expect(client.getCourses()).rejects.toThrow(
        'MinnaUz API timed out while attempting to fetching course list'
      );
    });
  });

  describe('Token Forwarding', () => {
    it('should forward Bearer token in Authorization header', async () => {
      const mockGet = vi.fn().mockResolvedValue({
        data: {
          id: 'user-123',
          email: 'test@minna.uz',
          role: 'USER',
          isPro: true,
        },
      });

      vi.mocked(axios.create).mockReturnValue({
        get: mockGet,
      } as any);

      const client = new MinnaUzApiClient('http://test-api/api', 5000);
      const profile = await client.getMyProfile('sample-jwt-token');

      expect(mockGet).toHaveBeenCalledWith(
        '/auth/me',
        expect.objectContaining({
          headers: { Authorization: 'Bearer sample-jwt-token' },
        })
      );
      expect(profile.email).toBe('test@minna.uz');
    });
  });
});
