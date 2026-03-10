"use client";

import dynamic from "next/dynamic";
import { Field, FieldError, FieldLabel } from "./field";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="min-h-44 rounded-b-xl border border-t-0 border-border bg-background px-4 py-3 text-sm text-muted-foreground">
      Loading editor...
    </div>
  ),
});

const editorModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ color: [] }, { background: [] }],
    ["link", "clean"],
  ],
};

const editorFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "blockquote",
  "list",
  "color",
  "background",
  "link",
];

type RichTextEditorProps = {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
};

const RichTextEditor = ({
  label,
  value = "",
  onChange,
  placeholder,
  error,
}: RichTextEditorProps) => {
  return (
    <Field data-invalid={!!error}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <div className="cs-rich-text overflow-hidden rounded-xl border border-input bg-background">
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={editorModules}
          formats={editorFormats}
          placeholder={placeholder}
        />
      </div>
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
};

export { RichTextEditor };
