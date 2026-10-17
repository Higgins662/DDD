"use client";

import { useState } from "react";

// A read-only text block with a Copy button, for the admin share kit.
export default function CopyBox({ label, text, hint, rows = 8, limit }) {
  const [copied, setCopied] = useState(false);
  const over = limit && text.length > limit;
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }
  return (
    <div className="kit-box">
      <div className="kit-box-head">
        <span className="kit-label">{label}</span>
        <span className={`kit-count${over ? " kit-over" : ""}`}>
          {text.length}
          {limit ? ` / ${limit}` : ""} chars
        </span>
        <button type="button" className="kit-copy" onClick={copy}>
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
      <textarea className="kit-text" readOnly value={text} rows={rows} onFocus={(e) => e.target.select()} />
      {hint ? <p className="kit-hint">{hint}</p> : null}
    </div>
  );
}
