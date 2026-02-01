import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { API_BASE_URL } from "@/config/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Image, Upload, CheckCircle2, Trash2, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface MediaFile {
  name: string;
  url: string;
  size: number;
  lastModified?: string;
}

export default function MediaUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ url: string; type: string }[]>([]);
  const [uploadedMedia, setUploadedMedia] = useState<MediaFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch existing media on load
  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/media/list`);
      if (response.ok) {
        const data = await response.json();
        setUploadedMedia(data.files || []);
      }
    } catch (err) {
      console.error("Failed to fetch media:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles(selected);

    const previewData = selected.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type,
    }));

    setPreviews(previewData);
  };

  const handleUpload = async () => {
    if (!files.length) return;

    setIsUploading(true);
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      const response = await fetch(`${API_BASE_URL}/media/upload-multiple`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Upload successful!");
        setFiles([]);
        setPreviews([]);
        fetchMedia(); // Refresh the list
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (fileName: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/media/delete/${fileName}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("File deleted");
        fetchMedia(); // Refresh the list
      } else {
        toast.error("Delete failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <AdminLayout
      title="Media Upload"
      description="Upload and manage images and videos"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Upload Media</CardTitle>
                <CardDescription>
                  Select images or videos to upload
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* File Selector */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <Image className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Images & Videos</p>
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG, MP4 supported (max 50MB)
                  </p>
                </div>
              </div>

              <label>
                <input
                  id="media-upload"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <Button
                  variant="outline"
                  onClick={() => document.getElementById("media-upload")?.click()}
                >
                  Select Files
                </Button>
              </label>
            </div>

            {/* Selected Count */}
            {files.length > 0 && (
              <Badge className="w-fit bg-success text-success-foreground">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {files.length} file(s) selected
              </Badge>
            )}

            {/* Preview */}
            {previews.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {previews.map((item, index) =>
                  item.type.startsWith("image") ? (
                    <img
                      key={index}
                      src={item.url}
                      className="h-16 w-full object-cover rounded border"
                      alt="preview"
                    />
                  ) : (
                    <video
                      key={index}
                      src={item.url}
                      className="h-16 w-full rounded border"
                    />
                  )
                )}
              </div>
            )}

            {/* Upload Button */}
            <Button
              className="w-full"
              onClick={handleUpload}
              disabled={!files.length || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Media"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Media Gallery Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <Image className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <CardTitle>Media Gallery</CardTitle>
                  <CardDescription>
                    {uploadedMedia.length} file(s) uploaded
                  </CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={fetchMedia}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : uploadedMedia.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No media uploaded yet
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {uploadedMedia.map((media, index) => (
                  <div
                    key={index}
                    className="relative group rounded-lg border overflow-hidden"
                  >
                    {media.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <img
                        src={media.url}
                        className="h-24 w-full object-cover"
                        alt={media.name}
                      />
                    ) : (
                      <video
                        src={media.url}
                        className="h-24 w-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDelete(media.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                      {formatFileSize(media.size)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
