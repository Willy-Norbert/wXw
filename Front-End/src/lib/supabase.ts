import { createClient } from '@supabase/supabase-js';

// Supabase project info
const supabaseUrl = 'https://wjlgkkjkhhpnxtohisxi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqbGdra2praGhwbnh0b2hpc3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MzExMTQsImV4cCI6MjA2NjQwNzExNH0.9iwBV1wZuwLg4adB4b4FCFqyzJUfNib0QSBLuocW2sw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Default bucket name is now 'ecommerce'
const BUCKET_NAME = 'ecommerce';

// Upload a file to Supabase Storage
export const uploadFile = async (file: File, bucket: string = BUCKET_NAME) => {
  const fileExt = file.name.split('.').pop();
  const timestamp = Date.now();
  const fileName = `file-${timestamp}.${fileExt}`;
  const filePath = `${fileName}`;

  console.log('Uploading to bucket:', bucket, 'with path:', filePath);

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error);
    throw error;
  }

  const { data: publicData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return {
    path: data.path,
    url: publicData.publicUrl,
    fullPath: data.fullPath,
  };
};

// Delete a file from Supabase Storage
export const deleteFile = async (path: string, bucket: string = BUCKET_NAME) => {
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    console.error('Delete error:', error);
    throw error;
  }

  console.log('File deleted:', path);
};
