
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export const useImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setImageUrl(''); // Clear URL when file is selected
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    setSelectedFile(null); // Clear file when URL is entered
    setPreviewImage(url); // Set preview to the URL directly
  };

  const uploadImage = async (file: File) => {
    try {
      console.log('Starting image upload...');
      
      const formData = new FormData();
      formData.append('image', file);
      
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData,
      });
      
      console.log('Upload response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Upload failed with status:', response.status, errorData);
        throw new Error(errorData.error || `Upload failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Upload successful:', data);
      // Return the full URL for uploaded images
      return `http://localhost:5000${data.imagePath}`;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const resetImageUpload = () => {
    setSelectedFile(null);
    setPreviewImage(null);
    setImageUrl('');
  };

  return {
    selectedFile,
    previewImage,
    imageUrl,
    handleFileChange,
    handleUrlChange,
    uploadImage,
    resetImageUpload,
    setPreviewImage
  };
};
