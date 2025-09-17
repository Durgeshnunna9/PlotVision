import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FileUploadProps {
  onUploadComplete?: (urls: string[]) => void;
  maxFiles?: number;
  accept?: string;
  bucketName?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  maxFiles = 5,
  accept = "image/*",
  bucketName = "property-images"
}) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles.slice(0, maxFiles);
      setFiles(validFiles);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (!user || files.length === 0) return;

    setUploading(true);
    const urls: string[] = [];

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, file);

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileName);

        urls.push(data.publicUrl);
      }

      setUploadedUrls([...uploadedUrls, ...urls]);
      setFiles([]);
      onUploadComplete?.(urls);

    } catch (error: any) {
      console.error('Upload error:', error.message);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="file-upload">Upload Images</Label>
        <div className="flex items-center gap-2">
          <Input
            id="file-upload"
            type="file"
            accept={accept}
            multiple
            max={maxFiles}
            onChange={handleFileSelect}
            className="flex-1"
          />
          <Button 
            onClick={uploadFiles}
            disabled={files.length === 0 || uploading || !user}
            className="btn-gradient"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </div>

      {/* Selected Files Preview */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {files.map((file, index) => (
            <div key={index} className="relative border rounded-lg p-2">
              <button
                onClick={() => removeFile(index)}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
              >
                <X className="h-3 w-3" />
              </button>
              <div className="flex flex-col items-center gap-2">
                <Image className="h-8 w-8 text-muted-foreground" />
                <span className="text-xs text-center truncate w-full">
                  {file.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files Preview */}
      {uploadedUrls.length > 0 && (
        <div className="space-y-2">
          <Label>Uploaded Images</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {uploadedUrls.map((url, index) => (
              <div key={index} className="border rounded-lg p-2">
                <img 
                  src={url} 
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-20 object-cover rounded"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {!user && (
        <p className="text-sm text-muted-foreground">
          Please log in to upload files.
        </p>
      )}
    </div>
  );
};