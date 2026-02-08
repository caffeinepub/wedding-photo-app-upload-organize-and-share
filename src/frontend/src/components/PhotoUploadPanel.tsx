import { useState, useRef } from 'react';
import { useUploadPhoto } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { X, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob } from '../backend';

interface PhotoUploadPanelProps {
  albumId: string;
  onClose: () => void;
}

interface UploadFile {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

export default function PhotoUploadPanel({ albumId, onClose }: PhotoUploadPanelProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadPhoto = useUploadPhoto();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const imageFiles = selectedFiles.filter((file) => file.type.startsWith('image/'));

    if (imageFiles.length !== selectedFiles.length) {
      toast.error('Only image files are allowed');
    }

    const newFiles: UploadFile[] = imageFiles.map((file) => ({
      file,
      status: 'pending',
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleUpload = async () => {
    const pendingFiles = files.filter((f) => f.status === 'pending');

    for (const uploadFile of pendingFiles) {
      try {
        setFiles((prev) =>
          prev.map((f) => (f.file === uploadFile.file ? { ...f, status: 'uploading' } : f))
        );

        const arrayBuffer = await uploadFile.file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);

        const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
          setFiles((prev) =>
            prev.map((f) =>
              f.file === uploadFile.file ? { ...f, progress: percentage } : f
            )
          );
        });

        await uploadPhoto.mutateAsync({
          albumId,
          filename: uploadFile.file.name,
          contentType: uploadFile.file.type,
          byteSize: BigInt(uploadFile.file.size),
          caption: null,
          blob,
        });

        setFiles((prev) =>
          prev.map((f) =>
            f.file === uploadFile.file ? { ...f, status: 'success', progress: 100 } : f
          )
        );
      } catch (error) {
        console.error('Upload error:', error);
        setFiles((prev) =>
          prev.map((f) =>
            f.file === uploadFile.file
              ? { ...f, status: 'error', error: 'Upload failed' }
              : f
          )
        );
      }
    }

    const allSuccess = files.every((f) => f.status === 'success');
    if (allSuccess) {
      toast.success('All photos uploaded successfully!');
      setTimeout(onClose, 1000);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const hasFiles = files.length > 0;
  const hasPendingFiles = files.some((f) => f.status === 'pending');
  const isUploading = files.some((f) => f.status === 'uploading');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Upload Photos</CardTitle>
            <CardDescription>Select multiple photos to upload to this album</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="file-upload" className="cursor-pointer">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to select photos or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 10MB</p>
            </div>
          </Label>
          <Input
            id="file-upload"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {hasFiles && (
          <div className="space-y-2">
            {files.map((uploadFile, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{uploadFile.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {uploadFile.status === 'uploading' && (
                    <Progress value={uploadFile.progress} className="mt-2 h-1" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {uploadFile.status === 'success' && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                  {uploadFile.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  )}
                  {uploadFile.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                      className="h-8 w-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {hasFiles && (
          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={!hasPendingFiles || isUploading}
              className="flex-1"
            >
              {isUploading ? 'Uploading...' : 'Upload All'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

