"use client";

import { InputHTMLAttributes, useState, useRef, ChangeEvent } from "react";
import { Icon } from "../Icon";

const Upload = ({
  label,
  accept = "image/*",
  multiple = false,
  onFileChange,
  maxSizeMB = 5,
}: {
  label: string;
  accept?: InputHTMLAttributes<HTMLInputElement>["accept"];
  multiple?: boolean;
  onFileChange?: (files: File[]) => void;
  maxSizeMB?: number;
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    setError("");

    if (!selectedFiles || selectedFiles.length === 0) {
      return;
    }

    const newFiles: File[] = [];
    const errors: string[] = [];

    Array.from(selectedFiles).forEach((file) => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        errors.push(`${file.name} vượt quá kích thước ${maxSizeMB}MB`);
        return;
      }

      if (accept && !accept.includes("*")) {
        const acceptedTypes = accept.split(",").map((type) => type.trim());
        const fileType = file.type;
        const fileExtension = file.name.split(".").pop()?.toLowerCase();

        const isAccepted = acceptedTypes.some((type) => {
          if (type.startsWith(".")) {
            return fileExtension === type.substring(1);
          }
          return fileType.match(type);
        });

        if (!isAccepted) {
          errors.push(`${file.name} không đúng định dạng`);
          return;
        }
      }

      newFiles.push(file);
    });

    if (errors.length > 0) {
      setError(errors.join(", "));
    }

    if (newFiles.length > 0) {
      const updatedFiles = multiple ? [...files, ...newFiles] : newFiles;
      setFiles(updatedFiles);
      onFileChange?.(updatedFiles);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFileChange?.(updatedFiles);
  };

  const handleClearAll = () => {
    setFiles([]);
    onFileChange?.([]);
    setError("");
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fakeEvent = {
        target: { files: e.dataTransfer.files },
      } as ChangeEvent<HTMLInputElement>;
      handleFileChange(fakeEvent);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      <p className="cs-paragraph text-sm! font-medium! mb-2">{label}</p>

      {/* Upload Area */}
      <div
        className="w-full h-[180px] cursor-pointer relative"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="w-full h-[180px] bg-[#F5F5F5] flex items-center justify-center border-2 border-dashed border-[#D9D9D9] rounded-[16px] hover:border-blue-500 transition-colors">
          <div className="flex flex-col items-center justify-center gap-2">
            <Icon.FileUpload className="w-[40px] h-[40px] text-gray-400" />
            <p className="text-[14px] font-medium text-[#999999] text-center">
              Kéo thả file vào đây hoặc{" "}
              <span className="text-blue-500 font-semibold">chọn file</span>
            </p>
            <p className="text-[12px] text-gray-400">
              {accept} (tối đa {maxSizeMB}MB)
            </p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="w-full h-full cursor-pointer absolute top-0 left-0 opacity-0"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-500 text-sm bg-red-50 p-2 rounded-md">
          {error}
        </div>
      )}

      {/* File Preview Section */}
      {files.length > 0 && (
        <div className="space-y-3 mt-4">
          <div className="flex justify-between items-center">
            <p className="font-medium text-gray-700">
              Đã chọn {files.length} file{files.length > 1 ? "s" : ""}
            </p>
            {files.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-sm text-red-500 hover:text-red-700 font-medium"
              >
                Xóa tất cả
              </button>
            )}
          </div>

          {/* Selected files list (alternative view) */}
          <div className="border rounded-lg p-3 bg-gray-50">
            <p className="font-medium text-gray-700 mb-2">Danh sách file:</p>
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li
                  key={`list-${file.name}-${index}`}
                  className="flex items-center justify-between p-2 bg-white rounded border"
                >
                  <div className="flex items-center gap-2">
                    {file.type.startsWith("image/") ? (
                      <div className="w-8 h-8 rounded overflow-hidden">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <Icon.FileUpload className="w-5 h-5 text-gray-400" />
                    )}
                    <span className="text-sm truncate max-w-xs">
                      {file.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Xóa
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export { Upload };
