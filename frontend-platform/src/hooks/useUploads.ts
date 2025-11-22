import { useMutation } from '@tanstack/react-query';
import { IUploadResponse } from '@academy/shared/types';
import { useAuth } from '@/stores/auth-store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

type UploadType = 'thumbnail' | 'video' | 'pdf' | 'document' | 'avatar';

/**
 * Upload a file to the server
 */
async function uploadFile(
  file: File,
  type: UploadType,
  accessToken: string
): Promise<IUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/uploads/${type}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'فشل رفع الملف');
  }

  return response.json();
}

/**
 * Hook to upload course thumbnail
 */
export function useUploadThumbnail() {
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: (file: File) => uploadFile(file, 'thumbnail', accessToken!),
  });
}

/**
 * Hook to upload video file
 */
export function useUploadVideo() {
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: (file: File) => uploadFile(file, 'video', accessToken!),
  });
}

/**
 * Hook to upload PDF file
 */
export function useUploadPdf() {
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: (file: File) => uploadFile(file, 'pdf', accessToken!),
  });
}

/**
 * Hook to upload document
 */
export function useUploadDocument() {
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: (file: File) => uploadFile(file, 'document', accessToken!),
  });
}

/**
 * Hook to upload avatar/profile picture
 */
export function useUploadAvatar() {
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: (file: File) => uploadFile(file, 'avatar', accessToken!),
  });
}

/**
 * Generic upload hook
 */
export function useUpload(type: UploadType) {
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: (file: File) => uploadFile(file, type, accessToken!),
  });
}
