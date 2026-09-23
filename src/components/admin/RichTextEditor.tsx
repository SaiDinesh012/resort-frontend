"use client";

import { useEffect, useRef, useState } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

/**
 * CKEditor 5 wrapper that lazy-loads the editor only on the client
 * to avoid SSR issues with Next.js.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  minHeight = 260,
}: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [CKComponent, setCKComponent] = useState<any>(null);
  const [ClassicEditor, setClassicEditor] = useState<any>(null);
  const [editorConfig, setEditorConfig] = useState<any>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Dynamically import CKEditor to avoid SSR issues
    Promise.all([
      import("@ckeditor/ckeditor5-react").then((m) => m.CKEditor),
      import("ckeditor5").then((m) => ({
        ClassicEditor: m.ClassicEditor,
        Bold: m.Bold,
        Italic: m.Italic,
        Underline: m.Underline,
        Strikethrough: m.Strikethrough,
        Link: m.Link,
        List: m.List,
        Heading: m.Heading,
        BlockQuote: m.BlockQuote,
        Essentials: m.Essentials,
        Paragraph: m.Paragraph,
        HorizontalLine: m.HorizontalLine,
      })),
    ])
      .then(([CKEditorComp, editors]) => {
        setCKComponent(() => CKEditorComp);
        setClassicEditor(() => editors.ClassicEditor);
        setEditorConfig({
          plugins: [
            editors.Essentials,
            editors.Paragraph,
            editors.Bold,
            editors.Italic,
            editors.Underline,
            editors.Strikethrough,
            editors.Link,
            editors.List,
            editors.Heading,
            editors.BlockQuote,
            editors.HorizontalLine,
          ],
          toolbar: {
            items: [
              "heading",
              "|",
              "bold",
              "italic",
              "underline",
              "strikethrough",
              "|",
              "link",
              "bulletedList",
              "numberedList",
              "|",
              "blockQuote",
              "horizontalLine",
            ],
          },
          heading: {
            options: [
              { model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
              { model: "heading2", view: "h2", title: "Heading 2", class: "ck-heading_heading2" },
              { model: "heading3", view: "h3", title: "Heading 3", class: "ck-heading_heading3" },
            ],
          },
          placeholder,
        });
      })
      .catch((err) => {
        console.error("CKEditor load error:", err);
        setLoadError(true);
      });
  }, [placeholder]);

  // Fallback textarea while CKEditor loads or if it errors
  if (!mounted || loadError || !CKComponent || !ClassicEditor) {
    return (
      <div>
        {loadError && (
          <p className="text-xs text-red-500 mb-1">
            CKEditor failed to load. Using plain textarea fallback.
          </p>
        )}
        {!loadError && !CKComponent && (
          <p className="text-xs text-warm-gray mb-1 italic">Loading editor…</p>
        )}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={10}
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm text-charcoal font-mono"
          style={{ minHeight }}
          placeholder={placeholder}
        />
      </div>
    );
  }

  return (
    <div className="ck-editor-wrapper" style={{ minHeight }}>
      <CKComponent
        editor={ClassicEditor}
        config={editorConfig}
        data={value}
        onChange={(_event: any, editor: any) => {
          const data = editor.getData();
          onChange(data);
        }}
      />
      <style>{`
        .ck-editor-wrapper .ck-editor__editable {
          min-height: ${minHeight}px;
          font-family: inherit;
          font-size: 0.875rem;
          color: #2d2d2d;
          line-height: 1.7;
          padding: 12px 16px;
        }
        .ck-editor-wrapper .ck-toolbar {
          border-radius: 6px 6px 0 0 !important;
          border-color: #e5e0d8 !important;
          background: #faf9f7 !important;
        }
        .ck-editor-wrapper .ck-editor__editable {
          border-radius: 0 0 6px 6px !important;
          border-color: #e5e0d8 !important;
        }
        .ck-editor-wrapper .ck-editor__editable:focus {
          box-shadow: 0 0 0 2px rgba(120, 85, 50, 0.2) !important;
          border-color: #8b6340 !important;
        }
        .ck-editor-wrapper .ck.ck-button.ck-on {
          background: #f0ebe3 !important;
          color: #8b6340 !important;
        }
      `}</style>
    </div>
  );
}
