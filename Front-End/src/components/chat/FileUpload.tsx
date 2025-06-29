
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, Image, FileText, Mic, X } from 'lucide-react';
import { uploadFile } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileSelect: (files: FileData[]) => void;
  disabled?: boolean;
}

export interface FileData {
  file: File;
  url: string;
  type: 'image' | 'pdf' | 'audio' | 'document';
  preview?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const { toast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<FileData[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const getFileType = (file: File): 'image' | 'pdf' | 'audio' | 'document' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type === 'application/pdf') return 'pdf';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'document';
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const fileDataArray: FileData[] = [];

    for (const file of fileArray) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB`,
          variant: "destructive",
        });
        continue;
      }

      const fileType = getFileType(file);
      let preview = '';

      if (fileType === 'image') {
        preview = URL.createObjectURL(file);
      }

      fileDataArray.push({
        file,
        url: '',
        type: fileType,
        preview
      });
    }

    setSelectedFiles(prev => [...prev, ...fileDataArray]);
  };

  const handleUploadAndSend = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    try {
      const uploadedFiles: FileData[] = [];

      for (const fileData of selectedFiles) {
        // Use 'ecommerce' bucket which exists in Supabase
        const uploadResult = await uploadFile(fileData.file, 'ecommerce');
        uploadedFiles.push({
          ...fileData,
          url: uploadResult.url
        });
      }

      onFileSelect(uploadedFiles);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col space-y-2">
      {selectedFiles.length > 0 && (
        <div className="bg-gray-50 p-3 rounded-lg space-y-2">
          <div className="text-sm font-medium text-gray-700">
            Selected Files ({selectedFiles.length})
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {selectedFiles.map((fileData, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                <div className="flex items-center space-x-2">
                  {fileData.type === 'image' && fileData.preview && (
                    <img src={fileData.preview} alt="" className="w-8 h-8 rounded object-cover" />
                  )}
                  {fileData.type === 'pdf' && <FileText className="w-6 h-6 text-red-500" />}
                  {fileData.type === 'audio' && <Mic className="w-6 h-6 text-green-500" />}
                  {fileData.type === 'document' && <FileText className="w-6 h-6 text-blue-500" />}
                  <span className="text-sm truncate max-w-32">{fileData.file.name}</span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <Button
            onClick={handleUploadAndSend}
            disabled={uploading}
            className="w-full"
            size="sm"
          >
            {uploading ? 'Uploading...' : 'Send Files'}
          </Button>
        </div>
      )}

      <div className="flex space-x-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => imageInputRef.current?.click()}
          disabled={disabled}
        >
          <Image className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <Paperclip className="w-4 h-4" />
        </Button>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default FileUpload;
