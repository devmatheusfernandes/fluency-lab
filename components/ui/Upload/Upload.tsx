"use client"; // This component uses client-side hooks

import * as React from "react";
import {
  useDropzone,
  type DropzoneOptions,
  type FileRejection,
} from "react-dropzone";
import { twMerge } from "tailwind-merge";
import { Text } from "@/components/ui/Text";

// A simple upload icon component
const UploadIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" x2="12" y1="3" y2="15" />
  </svg>
);

// Define the component's props
export interface UploadProps extends DropzoneOptions {
  /**
   * Optional className for the root div element.
   */
  className?: string;
  /**
   * A callback function that is invoked when files are dropped.
   * It receives the accepted files and file rejections.
   */
  onDrop: (acceptedFiles: File[], fileRejections: FileRejection[]) => void;
}

const Upload = React.forwardRef<HTMLDivElement, UploadProps>(
  ({ className, onDrop, ...options }, ref) => {
    const {
      getRootProps,
      getInputProps,
      isDragActive,
      acceptedFiles,
      fileRejections,
    } = useDropzone({
      ...options,
      onDrop,
    });

    // Base classes for the dropzone
    const baseClasses =
      "flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-colors duration-200 ease-in-out";

    // State-dependent classes
    const stateClasses = isDragActive
      ? "border-primary bg-primary/10"
      : "border-surface-2 bg-surface-1 hover:bg-surface-hover";

    return (
      <div className="w-full">
        <div
          {...getRootProps({
            className: twMerge(baseClasses, stateClasses, className),
          })}
          ref={ref}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center text-center">
            <UploadIcon className="w-10 h-10 mb-4 text-primary opacity-45" />
            {isDragActive ? (
              <Text weight="medium" variant="primary">
                Drop the files here ...
              </Text>
            ) : (
              <>
                {/* OBRIGATORIAMENTE ADICIONAR UM LIMITE DE TAMANHO E TIPOS DE ARQUIVOS */}
                <Text weight="medium">
                  Drag & drop some files here, or click to select files
                </Text>
                <Text size="sm" variant="placeholder" className="mt-1">
                  (Max file size and types can be configured)
                </Text>
              </>
            )}
          </div>
        </div>

        {/* Display accepted files */}
        {acceptedFiles.length > 0 && (
          <div className="mt-4">
            <Text weight="medium">Accepted files:</Text>
            <ul className="mt-2 list-disc list-inside space-y-1">
              {acceptedFiles.map((file) => (
                <li key={file.path}>
                  <Text size="sm">
                    {file.path} - {(file.size / 1024).toFixed(2)} KB
                  </Text>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Display rejected files */}
        {fileRejections.length > 0 && (
          <div className="mt-4">
            <Text weight="medium" variant="error">
              Rejected files:
            </Text>
            <ul className="mt-2 list-disc list-inside space-y-1">
              {fileRejections.map(({ file, errors }) => (
                <li key={file.path}>
                  <Text size="sm" variant="error">
                    {file.path} - {errors.map((e) => e.message).join(", ")}
                  </Text>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
);

Upload.displayName = "Upload";

export { Upload };
