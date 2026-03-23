"use client";

import Image from "next/image";
import {
  type ChangeEvent,
  forwardRef,
  type InputHTMLAttributes,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { PhotoView } from "react-photo-view";
import { CsButton } from "@/components/custom";
import { Icon } from "../Icon";

interface UploadFileItem {
  id: string;
  file: File;
  previewUrl: string;
}

interface UploadProps {
  label: string;
  accept?: InputHTMLAttributes<HTMLInputElement>["accept"];
  multiple?: boolean;
  maxSizeMB?: number;
  value?: File[];
  onChange?: (files: File[]) => void;
  error?: string;
  name?: string;
  onBlur?: () => void;
  disabled?: boolean;
}

const createFileId = () => Math.random().toString(36).substring(7);

const revokePreviewUrls = (items: UploadFileItem[]) => {
  items.forEach((item) => {
    URL.revokeObjectURL(item.previewUrl);
  });
};

const isAcceptedFileType = (
  file: File,
  accept?: InputHTMLAttributes<HTMLInputElement>["accept"],
) => {
  if (!accept) {
    return true;
  }

  const acceptedTypes = accept
    .split(",")
    .map((type) => type.trim().toLowerCase())
    .filter(Boolean);

  if (acceptedTypes.length === 0) {
    return true;
  }

  const fileType = file.type.toLowerCase();
  const fileExtension = `.${file.name.split(".").pop()?.toLowerCase() || ""}`;

  return acceptedTypes.some((type) => {
    if (type.startsWith(".")) {
      return fileExtension === type;
    }

    if (type.endsWith("/*")) {
      const baseType = type.slice(0, -1);
      return fileType.startsWith(baseType);
    }

    return fileType === type;
  });
};

const Upload = forwardRef<HTMLInputElement, UploadProps>(
  (
    {
      label,
      accept = "image/*",
      multiple = false,
      maxSizeMB = 5,
      value,
      onChange,
      error,
      name,
      onBlur,
      disabled,
    },
    ref,
  ) => {
    const [fileList, setFileList] = useState<UploadFileItem[]>([]);
    const [internalError, setInternalError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const fileListRef = useRef<UploadFileItem[]>([]);

    useImperativeHandle(ref, () => fileInputRef.current as HTMLInputElement);

    useEffect(() => {
      fileListRef.current = fileList;
    }, [fileList]);

    useEffect(() => {
      return () => {
        revokePreviewUrls(fileListRef.current);
      };
    }, []);

    useEffect(() => {
      const nextFiles = value || [];
      const currentFiles = fileListRef.current.map((item) => item.file);
      const isSameValue =
        nextFiles.length === currentFiles.length &&
        nextFiles.every((file, index) => file === currentFiles[index]);

      if (isSameValue) {
        return;
      }

      revokePreviewUrls(fileListRef.current);

      const nextFileList = nextFiles.map((file) => ({
        id: createFileId(),
        file,
        previewUrl: URL.createObjectURL(file),
      }));

      fileListRef.current = nextFileList;
      setFileList(nextFileList);
    }, [value]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      setInternalError("");

      if (!selectedFiles || selectedFiles.length === 0) {
        return;
      }

      const newFileItems: UploadFileItem[] = [];
      const errors: string[] = [];

      Array.from(selectedFiles).forEach((file) => {
        if (file.size > maxSizeMB * 1024 * 1024) {
          errors.push(`${file.name} exceeds ${maxSizeMB}MB size limit`);
          return;
        }

        if (!isAcceptedFileType(file, accept)) {
          errors.push(`${file.name} is not a valid file type`);
          return;
        }

        newFileItems.push({
          id: createFileId(),
          file,
          previewUrl: URL.createObjectURL(file),
        });
      });

      if (errors.length > 0) {
        setInternalError(errors.join(", "));
      }

      if (newFileItems.length > 0) {
        if (!multiple) {
          revokePreviewUrls(fileListRef.current);
        }

        const updatedList = multiple
          ? [...fileListRef.current, ...newFileItems]
          : newFileItems;

        fileListRef.current = updatedList;
        setFileList(updatedList);
        onChange?.(updatedList.map((item) => item.file));
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    const handleRemoveFile = (id: string) => {
      const fileToRemove = fileListRef.current.find((item) => item.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }

      const updatedList = fileListRef.current.filter((item) => item.id !== id);
      fileListRef.current = updatedList;
      setFileList(updatedList);
      onChange?.(updatedList.map((item) => item.file));
    };

    const handleClearAll = () => {
      revokePreviewUrls(fileListRef.current);
      fileListRef.current = [];
      setFileList([]);
      setInternalError("");
      onChange?.([]);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (
        !disabled &&
        e.dataTransfer.files &&
        e.dataTransfer.files.length > 0
      ) {
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

    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return "0 Bytes";

      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
    };

    const displayError = error || internalError;

    return (
      <div className="space-y-3">
        <p className="cs-paragraph text-sm! font-medium! mb-2">{label}</p>

        <label
          className={`w-full h-[180px] relative ${
            disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div
            className={`w-full h-[180px] bg-[#F5F5F5] flex items-center justify-center border-2 border-dashed rounded-[16px] transition-colors ${
              displayError
                ? "border-red-500 bg-red-50"
                : "border-[#D9D9D9] hover:border-blue-500"
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <Icon.FileUpload className="w-[40px] h-[40px] text-gray-400" />
              <p className="text-[14px] font-medium text-[#999999] text-center">
                Drag & drop file here{" "}
                <span className="text-black font-semibold">
                  or click to select
                </span>
              </p>
              <p className="text-[12px] text-gray-400">
                {accept} (maximum {maxSizeMB}MB)
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            name={name}
            accept={accept}
            multiple={multiple}
            onChange={handleFileChange}
            onBlur={onBlur}
            disabled={disabled}
            className="w-full h-full cursor-pointer absolute top-0 left-0 opacity-0 disabled:cursor-not-allowed"
          />
        </label>

        {displayError && (
          <div className="text-red-500 text-sm bg-red-50 p-2 rounded-md font-medium">
            {displayError}
          </div>
        )}

        {fileList.length > 0 && (
          <div className="space-y-3 mt-4">
            {multiple && (
              <div className="flex justify-between items-center">
                <p className="font-medium text-gray-700">
                  You have selected {fileList.length} file
                  {fileList.length > 1 ? "s" : ""}
                </p>
                <button
                  type="button"
                  onClick={handleClearAll}
                  disabled={disabled}
                  className="text-sm text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
                >
                  Clear all
                </button>
              </div>
            )}

            <div className="border rounded-lg p-3 bg-gray-50">
              <p className="font-medium text-gray-700 mb-2">Selected files:</p>
              <ul className="space-y-2">
                {fileList.map((item) => (
                  <li
                    key={`list-${item.id}`}
                    className="flex items-center justify-between p-2 bg-white rounded border"
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                        {item.file.type.startsWith("image/") ? (
                          <PhotoView src={item.previewUrl} key={item.id}>
                            <Image
                              src={item.previewUrl}
                              alt={item.file.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover cursor-pointer"
                            />
                          </PhotoView>
                        ) : (
                          <Icon.FileUpload className="w-5 h-5 text-gray-400 m-auto mt-2" />
                        )}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <span className="text-sm truncate max-w-[170px] font-medium ul">
                          {item.file.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatFileSize(item.file.size)}
                        </span>
                      </div>
                    </div>

                    <CsButton
                      type="button"
                      onClick={() => handleRemoveFile(item.id)}
                      disabled={disabled}
                      className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      icon={<Icon.DeleteBin />}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  },
);

Upload.displayName = "Upload";

export { Upload };
