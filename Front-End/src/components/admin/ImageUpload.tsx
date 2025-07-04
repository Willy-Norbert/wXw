
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useLanguage } from '@/contexts/LanguageContext';
import { Upload, Link } from 'lucide-react';

interface ImageUploadProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUrlChange: (url: string) => void;
  previewImage: string | null;
  field: any;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onFileChange, 
  onUrlChange, 
  previewImage, 
  field 
}) => {
  const { t } = useLanguage();
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [imageUrl, setImageUrl] = useState('');

  const handleUrlSubmit = () => {
    if (imageUrl.trim()) {
      onUrlChange(imageUrl.trim());
      field.onChange(imageUrl.trim());
    }
  };

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    if (url.trim()) {
      onUrlChange(url.trim());
      field.onChange(url.trim());
    }
  };

  return (
    <FormItem>
      <FormLabel>{t('products.image')}</FormLabel>
      <FormControl>
        <div className="space-y-4">
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={uploadMode === 'file' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUploadMode('file')}
            >
              <Upload className="w-4 h-4 mr-1" />
              Upload File
            </Button>
            <Button
              type="button"
              variant={uploadMode === 'url' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUploadMode('url')}
            >
              <Link className="w-4 h-4 mr-1" />
              Image URL
            </Button>
          </div>

          {/* File Upload Mode */}
          {uploadMode === 'file' && (
            <Input 
              type="file" 
              onChange={onFileChange}
            />
          )}

          {/* URL Input Mode */}
          {uploadMode === 'url' && (
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="Enter image URL..."
                value={imageUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
              />
            </div>
          )}

          {/* Image Preview */}
          {previewImage && (
            <div className="mt-2">
              <img 
                src={previewImage} 
                alt="Preview" 
                className="w-32 h-32 object-cover rounded border"
                onError={(e) => {
                  console.error('Image failed to load:', previewImage);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          
          {/* Hidden input to maintain form values */}
          <input type="hidden" {...field} />
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};
