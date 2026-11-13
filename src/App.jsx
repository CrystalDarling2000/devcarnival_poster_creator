import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Download, Image as ImageIcon, Link2, QrCode, RotateCcw, Upload } from "lucide-react";
import AlignmentGrid from "./components/AlignmentGrid";
import FilePicker from "./components/FilePicker";
import PosterPreview from "./components/PosterPreview";
import { DEFAULT_ALIGNMENT, LIMITS, TEMPLATE } from "./config/poster";
import { loadImageAsset, loadImageUrl, releaseAsset, validateImageFile } from "./lib/images";
import { createQrImage } from "./lib/qr";
import { renderPoster } from "./lib/renderPoster";
import { normalizeQrText, slugify } from "./lib/text";

const QR_ERROR = "That text is too long to fit in a QR code. Try a shorter link.";

export default function App() {
  const [template, setTemplate] = useState({ status: "loading", img: null });
  const [name, setName] = useState("");
  const [showName, setShowName] = useState(false);
  const [logo, setLogo] = useState(null);
  const [logoError, setLogoError] = useState("");
  const [align, setAlign] = useState(DEFAULT_ALIGNMENT);
  const [qrMode, setQrMode] = useState("link");
  const [qrLink, setQrLink] = useState("");
  const [qrGenerated, setQrGenerated] = useState({ img: null, error: "" });
  const [qrUpload, setQrUpload] = useState(null);
  const [qrUploadError, setQrUploadError] = useState("");
  const [status, setStatus] = useState({ type: "", text: "" });

  const loadTemplate = useCallback(() => {
    setTemplate({ status: "loading", img: null });
    loadImageUrl(TEMPLATE.url).then(
      (img) => setTemplate({ status: "ready", img }),
      () => setTemplate({ status: "error", img: null }),
    );
  }, []);
  useEffect(loadTemplate, [loadTemplate]);

  // Turn the typed link into a QR image (debounced, with a stale-result guard).
  useEffect(() => {
    if (qrMode !== "link") return undefined;
    const text = normalizeQrText(qrLink);
    if (!text) { setQrGenerated({ img: null, error: "" }); return undefined; }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const img = await createQrImage(text);
        if (!cancelled) setQrGenerated({ img, error: "" });
      } catch {
        if (!cancelled) setQrGenerated({ img: null, error: QR_ERROR });
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [qrMode, qrLink]);

  const qrImage = qrMode === "link" ? qrGenerated.img : qrUpload?.img ?? null;
  const cleanName = name.trim();
  const printedName = showName ? cleanName : "";
  const missing = [!cleanName && "community name", !logo && "logo", !qrImage && "QR code"].filter(Boolean);
  const ready = template.status === "ready" && missing.length === 0;

  // Any edit invalidates the "downloaded" message.
  useEffect(() => { setStatus({ type: "", text: "" }); }, [name, showName, logo, align, qrImage]);

  const acceptImage = async (file, current, setAsset, setError) => {
    const problem = validateImageFile(file);
    if (problem) { setError(problem); return; }
    try {
      const asset = await loadImageAsset(file);
      releaseAsset(current);
      setAsset(asset);
      setError("");
    } catch (reason) {
      setError(reason.message);
    }
  };
  const clearAsset = (current, setAsset, setError) => { releaseAsset(current); setAsset(null); setError(""); };

  const download = () => {
    if (!ready) return;
    const canvas = document.createElement("canvas");
    try {
      renderPoster(canvas, { template: template.img, logo, align, qr: qrImage, name: printedName, placeholders: false });
    } catch (reason) {
      setStatus({ type: "error", text: reason.message });
      return;
    }
    const fileName = `dev-carnival-${slugify(cleanName) || "community"}-poster.png`;
    canvas.toBlob((blob) => {
      if (!blob) { setStatus({ type: "error", text: "Your browser could not create the image. Please try again." }); return; }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      setStatus({ type: "ok", text: `Poster downloaded as ${fileName}` });
    }, "image/png");
  };

  const startOver = () => {
    const dirty = cleanName || logo || qrLink || qrUpload;
    if (dirty && !window.confirm("Clear everything and start over?")) return;
    releaseAsset(logo);
    releaseAsset(qrUpload);
    setName(""); setShowName(false); setLogo(null); setLogoError(""); setAlign(DEFAULT_ALIGNMENT);
    setQrMode("link"); setQrLink(""); setQrGenerated({ img: null, error: "" });
    setQrUpload(null); setQrUploadError(""); setStatus({ type: "", text: "" });
  };

  return (
    <div className="app">
      <header className="site-header">
        <div className="wrap header-inner">
          <span className="brand-mark" aria-hidden="true">DC</span>
          <div>
            <p className="brand-name">Dev Carnival 2027</p>
            <p className="brand-sub">Community partner poster</p>
          </div>
        </div>
      </header>

      <main className="wrap main">
        <div className="intro">
          <h1>Make your community partner poster</h1>
          <p>Add your community name, logo and QR code. We place them on the official Dev Carnival design — you just download it.</p>
        </div>

        <div className="layout">
          <form className="panel" onSubmit={(event) => { event.preventDefault(); download(); }} noValidate>
            <section className="step">
              <h2><span className="step-number">1</span>Community name</h2>
              <label htmlFor="community-name" className="sr-only">Community name</label>
              <input
                id="community-name"
                className="text-input"
                value={name}
                maxLength={LIMITS.nameMax}
                autoComplete="organization"
                placeholder="e.g. AI Geeks Chennai"
                aria-describedby="name-hint"
                onChange={(event) => setName(event.target.value)}
              />
              <label className="check">
                <input type="checkbox" checked={showName} onChange={(event) => setShowName(event.target.checked)} />
                <span>Also print this name under my logo</span>
              </label>
              <p id="name-hint" className="hint">Always used to name your file. Leave the box unticked if your logo already shows the name.<span className="counter">{name.length}/{LIMITS.nameMax}</span></p>
            </section>

            <section className="step">
              <h2><span className="step-number">2</span>Community logo</h2>
              <FilePicker
                id="logo-file"
                asset={logo}
                title="Upload your logo"
                describedBy={logoError ? "logo-error" : undefined}
                onFile={(file) => acceptImage(file, logo, setLogo, setLogoError)}
                onClear={() => clearAsset(logo, setLogo, setLogoError)}
              />
              {logoError && <p id="logo-error" className="error" role="alert"><AlertCircle size={15} aria-hidden="true" />{logoError}</p>}
              <p className="hint">A wide logo with a transparent background works best.</p>
              {logo && (
                <div className="align-box">
                  <div className="align-row">
                    <div>
                      <p className="label" id="align-label">Alignment</p>
                      <AlignmentGrid ax={align.ax} ay={align.ay} onChange={(ax, ay) => setAlign((value) => ({ ...value, ax, ay }))} />
                    </div>
                    <div className="size-control">
                      <label className="label" htmlFor="logo-size">Size <output htmlFor="logo-size">{Math.round(align.size * 100)}%</output></label>
                      <input
                        id="logo-size"
                        type="range"
                        min="30"
                        max="100"
                        step="1"
                        value={Math.round(align.size * 100)}
                        onChange={(event) => setAlign((value) => ({ ...value, size: Number(event.target.value) / 100 }))}
                      />
                      <button type="button" className="text-button" onClick={() => setAlign(DEFAULT_ALIGNMENT)}>Reset alignment</button>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="step">
              <h2><span className="step-number">3</span>QR code</h2>
              <div className="segmented" role="group" aria-label="QR code source">
                <button type="button" aria-pressed={qrMode === "link"} onClick={() => setQrMode("link")}><Link2 size={15} aria-hidden="true" />Create from link</button>
                <button type="button" aria-pressed={qrMode === "upload"} onClick={() => setQrMode("upload")}><Upload size={15} aria-hidden="true" />Upload image</button>
              </div>
              {qrMode === "link" ? (
                <>
                  <label htmlFor="qr-link" className="sr-only">Link for the QR code</label>
                  <input
                    id="qr-link"
                    className="text-input"
                    value={qrLink}
                    inputMode="url"
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="e.g. https://linktr.ee/yourcommunity"
                    aria-describedby="qr-hint"
                    onChange={(event) => setQrLink(event.target.value)}
                  />
                  {qrGenerated.error
                    ? <p className="error" role="alert"><AlertCircle size={15} aria-hidden="true" />{qrGenerated.error}</p>
                    : <p id="qr-hint" className="hint">Where should people land when they scan? Your community page, WhatsApp group or Linktree.</p>}
                </>
              ) : (
                <>
                  <FilePicker
                    id="qr-file"
                    asset={qrUpload}
                    title="Upload your QR code"
                    describedBy={qrUploadError ? "qr-upload-error" : undefined}
                    onFile={(file) => acceptImage(file, qrUpload, setQrUpload, setQrUploadError)}
                    onClear={() => clearAsset(qrUpload, setQrUpload, setQrUploadError)}
                  />
                  {qrUploadError && <p id="qr-upload-error" className="error" role="alert"><AlertCircle size={15} aria-hidden="true" />{qrUploadError}</p>}
                  <p className="hint">Use a square image with a white background.</p>
                </>
              )}
            </section>

            <div className="actions">
              <button type="submit" className="primary" disabled={!ready} aria-describedby="ready-note">
                <Download size={18} aria-hidden="true" />Generate &amp; download poster
              </button>
              <button type="button" className="secondary" onClick={startOver}><RotateCcw size={15} aria-hidden="true" />Start over</button>
            </div>
            <p id="ready-note" className="ready-note">
              {missing.length ? `Still needed: ${missing.join(", ")}.` : "Everything is in place. Your PNG is 1254 × 1254 px."}
            </p>
            <div className="status" role="status" aria-live="polite">
              {status.text && (
                <p className={status.type === "error" ? "error" : "success"}>
                  {status.type === "error" ? <AlertCircle size={15} aria-hidden="true" /> : <CheckCircle2 size={15} aria-hidden="true" />}
                  {status.text}
                </p>
              )}
            </div>
          </form>

          <section className="preview" aria-label="Live poster preview">
            <div className="preview-head"><ImageIcon size={15} aria-hidden="true" /><span>Live preview</span></div>
            <div className="preview-frame">
              {template.status === "ready" && (
                <PosterPreview
                  template={template.img}
                  logo={logo}
                  align={align}
                  qr={qrImage}
                  name={printedName}
                  label={`Dev Carnival poster preview${cleanName ? ` for ${cleanName}` : ""}`}
                />
              )}
              {template.status === "loading" && <p className="preview-message">Loading the poster…</p>}
              {template.status === "error" && (
                <div className="preview-message">
                  <p>The poster design could not be loaded.</p>
                  <button type="button" className="secondary" onClick={loadTemplate}><RotateCcw size={15} aria-hidden="true" />Try again</button>
                </div>
              )}
            </div>
            <p className="preview-note"><QrCode size={14} aria-hidden="true" />Scan the QR on your screen with your phone before you share the poster.</p>
          </section>
        </div>
      </main>

      <footer className="wrap site-footer">Your files stay in your browser — nothing is uploaded.</footer>
    </div>
  );
}
