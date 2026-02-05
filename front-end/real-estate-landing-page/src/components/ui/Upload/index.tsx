"use client";

import {
  InputHTMLAttributes,
  useState,
  useRef,
  ChangeEvent,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Icon } from "../Icon";
import { PhotoView } from "react-photo-view";
import Image from "next/image";
import { Button } from "../Button";

interface FileWithStatus {
  id: string;
  file: File;
  status: "uploading" | "success" | "error";
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
    const [fileList, setFileList] = useState<FileWithStatus[]>([]);
    const [internalError, setInternalError] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => fileInputRef.current as HTMLInputElement);

    useEffect(() => {
      return () => {
        fileList.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      };
    }, []);

    useEffect(() => {
      if (!value || value.length === 0) {
        setFileList([]);
      }
    }, [value]);

    const uploadFile = async (fileId: string) => {
      return new Promise<void>((resolve, reject) => {
        const time = Math.random() * 2000 + 1000;
        setTimeout(() => {
          if (Math.random() < 0.1) {
            reject(new Error("Upload failed"));
          } else {
            resolve();
          }
        }, time);
      });
    };

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      setInternalError("");

      if (!selectedFiles || selectedFiles.length === 0) {
        return;
      }

      const newFilesItems: FileWithStatus[] = [];
      const errors: string[] = [];
      const validFiles: File[] = [];

      Array.from(selectedFiles).forEach((file) => {
        if (file.size > maxSizeMB * 1024 * 1024) {
          errors.push(`${file.name} exceeds ${maxSizeMB}MB size limit`);
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
            errors.push(`${file.name} is not a valid file type`);
            return;
          }
        }

        validFiles.push(file);
        newFilesItems.push({
          id: Math.random().toString(36).substring(7),
          file: file,
          status: "uploading",
          previewUrl: URL.createObjectURL(file),
        });
      });

      if (errors.length > 0) {
        setInternalError(errors.join(", "));
      }

      if (newFilesItems.length > 0) {
        const updatedList = multiple
          ? [...fileList, ...newFilesItems]
          : newFilesItems;

        setFileList(updatedList);

        newFilesItems.forEach((item) => {
          uploadFile(item.id)
            .then(() => {
              setFileList((prev) =>
                prev.map((f) =>
                  f.id === item.id ? { ...f, status: "success" } : f,
                ),
              );
            })
            .catch(() => {
              setFileList((prev) =>
                prev.map((f) =>
                  f.id === item.id ? { ...f, status: "error" } : f,
                ),
              );
            });
        });
        if (onChange) {
          const allFiles = updatedList.map((item) => item.file);
          onChange(allFiles);
        }
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    const handleRemoveFile = (id: string) => {
      const fileToRemove = fileList.find((f) => f.id === id);
      if (fileToRemove) URL.revokeObjectURL(fileToRemove.previewUrl);

      const updatedList = fileList.filter((item) => item.id !== id);
      setFileList(updatedList);

      if (onChange) {
        onChange(updatedList.map((item) => item.file));
      }
    };

    const handleClearAll = () => {
      fileList.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      setFileList([]);
      setInternalError("");

      if (onChange) {
        onChange([]);
      }
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
    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const displayError = error || internalError;

    return (
      <div className="space-y-3">
        <p className="cs-paragraph text-sm! font-medium! mb-2">{label}</p>

        <div
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
        </div>

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
              <p className="font-medium text-gray-700 mb-2">Danh sách file:</p>
              <ul className="space-y-2">
                {fileList.map((item) => (
                  <li
                    key={`list-${item.id}`}
                    className={`flex items-center justify-between p-2 bg-white rounded border ${
                      item.status === "error" ? "border-red-300 bg-red-50" : ""
                    }`}
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
                              className={`w-full h-full object-cover cursor-pointer ${
                                item.status === "uploading" ? "opacity-50" : ""
                              }`}
                            />
                          </PhotoView>
                        ) : (
                          <Icon.FileUpload className="w-5 h-5 text-gray-400 m-auto mt-2" />
                        )}

                        {item.status === "uploading" && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <svg
                              className="animate-spin h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                          </div>
                        )}
                        {item.status === "error" && (
                          <div className="absolute inset-0 flex items-center justify-center bg-red-100/80">
                            <span className="text-red-600 font-bold text-xs">
                              !
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <span className="text-sm truncate max-w-[170px] font-medium ul">
                          {item.file.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {item.status === "uploading" && (
                            <span className="text-blue-500">Uploading...</span>
                          )}
                          {item.status === "success" && (
                            <span className="text-green-500">Done</span>
                          )}
                          {item.status === "error" && (
                            <span className="text-red-500">Failed</span>
                          )}
                          {item.status !== "uploading" &&
                            ` • ${formatFileSize(item.file.size)}`}
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={() => handleRemoveFile(item.id)}
                      disabled={item.status === "uploading" || disabled}
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
