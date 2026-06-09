import { API_BASE_URL } from '@/lib/api-client';

export type TherapistDocuments = {
  portrait: File;
  citizenIdFront: File;
  citizenIdBack: File;
  certificates: File[];
};

export type UploadedUrls = {
  portraitUrl: string;
  citizenIdFrontUrl: string;
  citizenIdBackUrl: string;
  certificateUrls: string[];
};

/**
 * Upload một file đơn lẻ và trả về URL
 */
export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload/`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload thất bại' }));
    throw new Error(error.error?.message || error.error || `Lỗi upload: ${response.status}`);
  }

  const data = await response.json();
  return data.data?.url || data.url;
}

export async function uploadTherapistDocuments(
  docs: TherapistDocuments
): Promise<UploadedUrls> {
  const formData = new FormData();
  formData.append('portrait', docs.portrait);
  formData.append('citizen_id_front', docs.citizenIdFront);
  formData.append('citizen_id_back', docs.citizenIdBack);

  docs.certificates.forEach(cert => {
    formData.append('certificates', cert);
  });

  // Dùng fetch trực tiếp vì FormData không thể stringify
  const response = await fetch(`${API_BASE_URL}/therapists/upload/documents/`, {
    method: 'POST',
    body: formData,
    // Không set Content-Type header, browser tự set với boundary
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload thất bại' }));
    throw new Error(error.error || `Lỗi upload: ${response.status}`);
  }

  const data = await response.json();

  return {
    portraitUrl: data.portrait_url,
    citizenIdFrontUrl: data.citizen_id_front_url,
    citizenIdBackUrl: data.citizen_id_back_url,
    certificateUrls: data.certificate_urls,
  };
}
