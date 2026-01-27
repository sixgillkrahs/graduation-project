"use client";

import {
  useState,
  useRef,
  ChangeEvent,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
  InputHTMLAttributes,
} from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

interface UploadedFile {
  id: string;
  file: File;
  previewUrl: string;
}

interface UploadProps {
  /** Label displayed above the upload area */
  label?: string;
  /** Description text displayed below the main text */
  description?: string;
  /** Accepted file types */
  accept?: InputHTMLAttributes<HTMLInputElement>["accept"];
  /** Allow multiple file selection */
  multiple?: boolean;
  /** Maximum file size in MB */
  maxSizeMB?: number;
  /** Controlled value - array of Files */
  value?: File[];
  /** Callback when files change */
  onChange?: (files: File[]) => void;
  /** Error message to display */
  error?: string;
  /** Input name for form integration */
  name?: string;
  /** Blur handler for form integration */
  onBlur?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Additional class names for the container */
  className?: string;
}

const Upload = forwardRef<HTMLInputElement, UploadProps>(
  (
    {
      label,
      description,
      accept = "image/*",
      multiple = true,
      maxSizeMB = 5,
      value,
      onChange,
      error,
      name,
      onBlur,
      disabled,
      className,
    },
    ref
  ) => {
    const [fileList, setFileList] = useState<UploadedFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [internalError, setInternalError] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => fileInputRef.current as HTMLInputElement);

    // Cleanup preview URLs on unmount
    useEffect(() => {
      return () => {
        fileList.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      };
    }, []);

    // Sync with controlled value
    useEffect(() => {
      if (!value || value.length === 0) {
        setFileList([]);
      }
    }, [value]);

    const processFiles = useCallback(
      (files: FileList | null) => {
        if (!files || files.length === 0) return;

        setInternalError("");
        const newFiles: UploadedFile[] = [];
        const errors: string[] = [];
        const validFiles: File[] = [];

        Array.from(files).forEach((file) => {
          // Size validation
          if (file.size > maxSizeMB * 1024 * 1024) {
            errors.push(`${file.name} exceeds ${maxSizeMB}MB size limit`);
            return;
          }

          // Type validation
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
          newFiles.push({
            id: Math.random().toString(36).substring(7),
            file,
            previewUrl: URL.createObjectURL(file),
          });
        });

        if (errors.length > 0) {
          setInternalError(errors.join(", "));
        }

        if (newFiles.length > 0) {
          const updatedList = multiple ? [...fileList, ...newFiles] : newFiles;
          setFileList(updatedList);

          if (onChange) {
            onChange(updatedList.map((item) => item.file));
          }
        }

        // Reset input value to allow selecting the same file again
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
      [accept, fileList, maxSizeMB, multiple, onChange]
    );

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      processFiles(e.target.files);
    };

    const handleRemoveFile = (id: string) => {
      const fileToRemove = fileList.find((f) => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }

      const updatedList = fileList.filter((item) => item.id !== id);
      setFileList(updatedList);

      if (onChange) {
        onChange(updatedList.map((item) => item.file));
      }
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (!disabled && e.dataTransfer.files?.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    };

    const handleClick = () => {
      if (!disabled && fileInputRef.current) {
        fileInputRef.current.click();
      }
    };

    const displayError = error || internalError;

    return (
      <div className={cn("space-y-4", className)}>
        {/* Label */}
        {label && (
          <p className="text-sm font-medium text-foreground">{label}</p>
        )}

        {/* Drop Zone */}
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleClick();
            }
          }}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            "relative flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all",
            disabled
              ? "cursor-not-allowed opacity-60"
              : "cursor-pointer hover:border-primary hover:bg-primary/5",
            isDragging && !disabled
              ? "border-primary bg-primary/10"
              : "border-muted-foreground/30 bg-muted/30",
            displayError && "border-destructive bg-destructive/5"
          )}
        >
          {/* Upload Icon */}
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-full",
              isDragging ? "bg-primary/20" : "bg-muted"
            )}
          >
            <Icon.FileUpload
              className={cn(
                "h-7 w-7",
                isDragging ? "text-primary" : "text-muted-foreground"
              )}
            />
          </div>

          {/* Main Text */}
          <p className="text-center text-base font-bold text-foreground">
            Drag and drop images here
          </p>

          {/* Description */}
          {description && (
            <p className="text-center text-sm text-muted-foreground">
              {description}
            </p>
          )}

          {/* File Type Info */}
          <p className="text-center text-xs text-muted-foreground">
            {accept} (maximum {maxSizeMB}MB per file)
          </p>

          {/* Hidden Input */}
          <input
            ref={fileInputRef}
            type="file"
            name={name}
            accept={accept}
            multiple={multiple}
            onChange={handleFileChange}
            onBlur={onBlur}
            disabled={disabled}
            className="sr-only"
          />
        </div>

        {/* Error Message */}
        {displayError && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm font-medium text-destructive">
            {displayError}
          </div>
        )}

        {/* Uploaded Images Section */}
        {fileList.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">
                Uploaded Images ({fileList.length})
              </p>
              {multiple && fileList.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    fileList.forEach((item) =>
                      URL.revokeObjectURL(item.previewUrl)
                    );
                    setFileList([]);
                    if (onChange) {
                      onChange([]);
                    }
                  }}
                  disabled={disabled}
                  className="text-sm font-medium text-destructive hover:text-destructive/80 disabled:opacity-50"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Images Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {fileList.map((item) => (
                <div
                  key={item.id}
                  className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
                >
                  {item.file.type.startsWith("image/") ? (
                    <Image
                      src={item.previewUrl}
                      alt={item.file.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Icon.FileUpload className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}

                  {/* Overlay with Delete Button */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(item.id);
                      }}
                      disabled={disabled}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-destructive shadow-md transition-transform hover:scale-110 disabled:opacity-50"
                      title="Remove image"
                    >
                      <Icon.DeleteBin className="h-5 w-5" />
                    </button>
                  </div>

                  {/* File Name Tooltip */}
                  <div className="absolute bottom-0 left-0 right-0 truncate bg-black/60 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {item.file.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

Upload.displayName = "Upload";

export default Upload;
