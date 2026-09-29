"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Heading2,
  Heading3,
  Quote,
  Code2,
  Undo2,
  Redo2,
} from "lucide-react";

interface ToolbarButton {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  label: string;
  command: () => void;
}

export function RichTextEditor({
  value,
  onChange,
  minHeight = 260,
}: {
  value: string;
  onChange: (html: string) => void;
  minHeight?: number;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showHtml, setShowHtml] = useState(false);
  const [htmlDraft, setHtmlDraft] = useState(value);

  useEffect(() => {
    if (editorRef.current && !showHtml && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value, showHtml]);

  function exec(command: string, arg?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    handleInput();
  }

  function handleInput() {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }

  function insertLink() {
    const url = window.prompt("Link URL");
    if (url) exec("createLink", url);
  }

  const buttons: ToolbarButton[] = [
    { icon: Bold, label: "Bold", command: () => exec("bold") },
    { icon: Italic, label: "Italic", command: () => exec("italic") },
    { icon: Underline, label: "Underline", command: () => exec("underline") },
    { icon: Heading2, label: "Heading", command: () => exec("formatBlock", "<h2>") },
    { icon: Heading3, label: "Subheading", command: () => exec("formatBlock", "<h3>") },
    { icon: Quote, label: "Quote", command: () => exec("formatBlock", "<blockquote>") },
    { icon: List, label: "Bullet list", command: () => exec("insertUnorderedList") },
    { icon: ListOrdered, label: "Numbered list", command: () => exec("insertOrderedList") },
    { icon: Link2, label: "Link", command: insertLink },
    { icon: Undo2, label: "Undo", command: () => exec("undo") },
    { icon: Redo2, label: "Redo", command: () => exec("redo") },
  ];

  return (
    <div className="overflow-hidden rounded-[8px] border border-border bg-surface">
      <div className="flex items-center gap-0.5 border-b border-border bg-section px-2 py-1.5">
        {buttons.map(({ icon: Icon, label, command }) => (
          <button
            key={label}
            type="button"
            title={label}
            onMouseDown={(e) => e.preventDefault()}
            onClick={command}
            className="flex h-8 w-8 items-center justify-center rounded-[4px] text-text-muted hover:bg-surface hover:text-primary transition-colors cursor-pointer"
          >
            <Icon size={16} strokeWidth={1.75} />
          </button>
        ))}
        <div className="mx-1 h-5 w-px bg-border" />
        <button
          type="button"
          onClick={() => {
            if (!showHtml) setHtmlDraft(editorRef.current?.innerHTML ?? value);
            else onChange(htmlDraft);
            setShowHtml((s) => !s);
          }}
          className={clsx(
            "flex h-8 items-center gap-1.5 rounded-[4px] px-2 text-xs font-semibold transition-colors cursor-pointer",
            showHtml ? "bg-primary-light text-primary" : "text-text-muted hover:bg-surface hover:text-primary"
          )}
        >
          <Code2 size={14} strokeWidth={1.75} />
          HTML
        </button>
      </div>

      {showHtml ? (
        <textarea
          value={htmlDraft}
          onChange={(e) => setHtmlDraft(e.target.value)}
          style={{ minHeight }}
          className="w-full min-w-0 resize-y break-all px-4 py-3 font-mono text-[13px] text-text focus:outline-none"
          spellCheck={false}
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          style={{ minHeight }}
          className="editable-html w-full min-w-0 resize-y overflow-hidden px-4 py-3 text-sm text-text focus:outline-none"
          suppressContentEditableWarning
        />
      )}
    </div>
  );
}
