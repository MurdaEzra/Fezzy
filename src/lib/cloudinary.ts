import { supabase } from '../contexts/supabaseClient';

type SignedUploadResponse = {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
};

export async function uploadImageToCloudinary(file: File, folder: string) {
  const { data, error } = await supabase.functions.invoke('cloudinary-signature', {
    body: { folder }
  });

  if (error) {
    throw error;
  }

  const signed = data as SignedUploadResponse;

  if (!signed?.signature || !signed?.timestamp || !signed?.apiKey || !signed?.cloudName) {
    throw new Error('Cloudinary signature response is incomplete.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', signed.apiKey);
  formData.append('timestamp', String(signed.timestamp));
  formData.append('signature', signed.signature);
  formData.append('folder', signed.folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData
    }
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(details || 'Cloudinary upload failed.');
  }

  const result = await response.json();
  return {
    url: result.secure_url as string,
    publicId: result.public_id as string
  };
}
