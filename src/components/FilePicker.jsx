import { useState } from "react";
import { Upload, X } from "lucide-react";
import { LIMITS } from "../config/poster";

// Click-or-drop image picker. The real <input> stays in the DOM (visually
// hidden) so it is keyboard-accessible; the label is the visible target.
export default function FilePicker({ id, asset, title, onFile, onClear, describedBy }) {
  const [over, setOver] = useState(false);
  const pick = (file) => { if (file) onFile(file); };
  return (
    <div className="picker">
      <label
        htmlFor={id}
        className={`drop${over ? " is-over" : ""}${asset ? " has-file" : ""}`}
        onDragOver={(event) => { event.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(event) => { event.preventDefault(); setOver(false); pick(event.dataTransfer.files?.[0]); }}
      >
        <span className="drop-thumb">{asset ? <img src={asset.url} alt="" /> : <Upload size={20} aria-hidden="true" />}</span>
        <span className="drop-text">
          <strong>{asset ? asset.name : title}</strong>
          <small>{asset ? "Click or drop to replace" : "PNG, JPG or WebP · up to 8 MB · click or drop"}</small>
        </span>
        <input
          id={id}
          className="sr-only"
          type="file"
          accept={LIMITS.imageAccept}
          aria-describedby={describedBy}
          onChange={(event) => { pick(event.target.files?.[0]); event.target.value = ""; }}
        />
      </label>
      {asset && (
        <button type="button" className="icon-button" onClick={onClear} aria-label={`Remove ${asset.name}`}>
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
