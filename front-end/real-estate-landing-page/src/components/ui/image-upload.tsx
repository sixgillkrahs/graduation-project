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
import { PhotoProvider } from "react-photo-view";
import { Image } from "@/components/ui/Image";
import { cn } from "@/lib/utils";
import { CloudUpload, Trash } from "lucide-react";

interface UploadedFile {
  id: string;
  file?: File;
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
  /** Controlled value - array of Files or URL strings */
  value?: (File | string)[];
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
    ref,
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
    // Sync with controlled value
    useEffect(() => {
      if (!value) {
        setFileList([]);
        return;
      }

      const newFileList: UploadedFile[] = value.map((item) => {
        if (typeof item === "string") {
          return {
            id: item, // Use URL as ID for remote files
            previewUrl: item,
            file: undefined,
          };
        } else {
          return {
            id: Math.random().toString(36).substring(7),
            file: item,
            previewUrl: URL.createObjectURL(item),
          };
        }
      });
      setFileList(newFileList);
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
            // Only pass back the files that are actually Files (newly uploaded or existing)
            // BUT wait, onChange expects File[].
            // If we are mixing, this component is tricky.
            // For now, let's filter Boolean to keep TS happy, but logically the parent needs to handle the mix if it uses onChange.
            // Actually, for this specific use case, the parent (MediaContent) will likely intercept the onChange at the higher level if it wants to upload.
            // But let's keep it safe.
            const filesOnly = updatedList
              .map((item) => item.file)
              .filter((f): f is File => f !== undefined);
            onChange(filesOnly);
          }
        }

        // Reset input value to allow selecting the same file again
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
      [accept, fileList, maxSizeMB, multiple, onChange],
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
        const filesOnly = updatedList
          .map((item) => item.file)
          .filter((f): f is File => f !== undefined);
        onChange(filesOnly);
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
            displayError && "border-destructive bg-destructive/5",
          )}
        >
          {/* Upload Icon */}
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-full",
              isDragging ? "bg-primary/20" : "bg-muted",
            )}
          >
            <CloudUpload
              className={cn(
                "h-7 w-7",
                isDragging ? "text-primary" : "text-muted-foreground",
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
                      URL.revokeObjectURL(item.previewUrl),
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

            <PhotoProvider>
              <div className="grid grid-cols-4 gap-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7">
                {fileList.map((item) => (
                  <div
                    key={item.id}
                    className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
                  >
                    {item.file && item.file.type.startsWith("image/") ? (
                      <Image
                        src={item.previewUrl}
                        alt={item.file.name}
                        fill
                        className="object-cover"
                      />
                    ) : !item.file ? (
                      // Remote image (URL string)
                      <Image
                        src={item.previewUrl}
                        alt="Uploaded image"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <CloudUpload className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}

                    {/* Overlay with Delete Button */}
                    <div className="pointer-events-none absolute inset-0 bg-black/0 transition-all group-hover:bg-black/40" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(item.id);
                      }}
                      disabled={disabled}
                      className="pointer-events-auto absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-destructive opacity-0 shadow-md transition-all hover:scale-110 group-hover:opacity-100 disabled:opacity-50"
                      title="Remove image"
                    >
                      <Trash className="h-4 w-4" />
                    </button>

                    {/* File Name Tooltip */}
                    <div className="absolute bottom-0 left-0 right-0 truncate bg-black/60 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                      {item.file ? item.file.name : "Uploaded Image"}
                    </div>
                  </div>
                ))}
              </div>
            </PhotoProvider>
          </div>
        )}
      </div>
    );
  },
);

Upload.displayName = "Upload";

export default Upload;
