// components/ui/file-upload.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { File, X } from "lucide-react";
import Image from "next/image";

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  initialFile?: string; // Can be a File object or URL string
}

export function FileUpload({
  onFileChange,
  initialFile,
}:  FileUploadProps
) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    initialFile || null
  );

useEffect(() => {
    if (initialFile && typeof initialFile === 'string') {
      // This is a URL string from existing submission
      setPreview(initialFile);
    }
  }, [initialFile]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setFile(selectedFile);
        onFileChange(selectedFile);
        
        // Create preview for images
        if (selectedFile.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = () => {
            setPreview(reader.result as string);
          };
          reader.readAsDataURL(selectedFile);
        } else {
          setPreview(null);
        }
      }
    },
    [onFileChange]
  );

  const removeFile = useCallback(() => {
    setFile(null);
    setPreview(null);
    onFileChange(null);
  }, [onFileChange]);

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative">
          {preview.startsWith("data:image") ? (
            <img
              src={preview}
              alt="Preview"
              className="h-32 object-contain rounded-md border"
            />
          ) : (
            <div className="flex items-center justify-center h-32 border rounded-md bg-gray-50">
              <File className="h-10 w-10 text-gray-400" />
              <span className="ml-2 text-sm text-gray-600">
                {file?.name || "File selected"}
              </span>
            </div>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute -top-2 -right-2 p-1 rounded-full bg-white border shadow-sm hover:bg-gray-50"
            onClick={removeFile}
          >
            <X className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <File className="h-8 w-8 text-gray-400 mb-2" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PDF, DOCX, ZIP, etc. (Max 10MB)
              </p>
            </div>
            <Input
              id="dropzone-file"
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>
      )}
    </div>
  );
}