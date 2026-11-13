import { useEffect, useRef, useState } from "react";
import {
  ArrowDownToLine, Check, ChevronDown, ImagePlus, LockKeyhole, Settings2,
  ShieldCheck, Upload, UsersRound, X,
} from "lucide-react";
import { categoryLabels } from "./config/communityRegistry";
import { useCommunity } from "./context/CommunityContext";
import { renderPoster } from "./utils/posterRenderer";

const sections = [
  { id: "collaboration", title: "Community collaboration", detail: "For events and projects created together.", number: "01" },
  { id: "attendee", title: "Speaker & attendee", detail: "Introduce a speaker, guest, or attendee.", number: "02" },
  { id: "leads", title: "Community leads", detail: "Introduce your community and organizing team.", number: "03" },
];

const MAX_IMAGE_SIZE = 4 * 1024 * 1024;
const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("The selected image could not be read."));
    reader.readAsDataURL(file);
  });
}

function getImageDimensions(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("The selected file is not a valid image."));
    image.src = source;
  });
}

function validateImage(file) {
  if (!allowedTypes.includes(file.type)) throw new Error("Choose a JPG, PNG, or WebP image.");
  if (file.size > MAX_IMAGE_SIZE) throw new Error("Images must be 4 MB or smaller to fit in this browser's local configuration.");
}

function BrandFields({ name, setName, logo, setLogo, error, setError, community }) {
  const fileRef = useRef(null);

  const onLogoChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      validateImage(file);
      setLogo(await readImage(file));
      setError("");
    } catch (reason) {
      setError(reason.message);
    }
  };

  return (
    <section className="brand-fields">
      <div className="brand-fields-heading">
        <div className="section-index">A</div>
        <div>
          <span className="eyebrow">YOUR POSTER IDENTITY</span>
          <h2>Community details</h2>
          <p>These details update all three poster previews as you type.</p>
        </div>
      </div>
      <div className="brand-fields-grid">
        <label className="field-control">
          <span>Community name</span>
          <input value={name} onChange={(event) => setName(event.target.value.slice(0, 80))} placeholder={community?.name || "Your community name"} maxLength={80} />
        </label>
        <div className="field-control">
          <span>Community logo <small>JPG, PNG or WebP · up to 4 MB</small></span>
          <button className={`logo-picker ${logo ? "has-logo" : ""}`} type="button" onClick={() => fileRef.current?.click()}>
            {logo ? <img src={logo} alt="Uploaded community logo" /> : <><ImagePlus size={19} /><span>Upload your logo</span></>}
          </button>
          <input ref={fileRef} className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={onLogoChange} />
          {logo && <button className="clear-logo" type="button" onClick={() => setLogo("")}>Remove logo <X size={13} /></button>}
        </div>
      </div>
      {error && <p className="inline-error" role="alert">{error}</p>}
    </section>
  );
}

function TemplateUpload({ section, template, onUpload, corner, setCorner, logoScale, setLogoScale, error }) {
  const inputRef = useRef(null);
  return (
    <div className="admin-template">
      <input ref={inputRef} className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => onUpload(section.id, event)} />
      <div className="admin-template-row">
        <div className="template-file-icon"><Upload size={17} /></div>
        <div className="template-file-copy">
          <strong>{template?.isUploaded ? "Your approved template" : "Starter template"}</strong>
          <small>{template?.width && template?.height ? `${template.width} × ${template.height}px` : "Upload a poster background image"}</small>
        </div>
        <button className="button button-outline" type="button" onClick={() => inputRef.current?.click()}>
          <Upload size={15} /> {template?.isUploaded ? "Replace" : "Upload template"}
        </button>
      </div>
      <div className="template-position-row">
        <label><span>Brand position</span>
          <select value={corner} onChange={(event) => setCorner(event.target.value)}>
            <option value="top-left">Top left</option><option value="top-right">Top right</option>
            <option value="bottom-left">Bottom left</option><option value="bottom-right">Bottom right</option>
          </select>
        </label>
        <label><span>Logo size</span><input type="range" min="0.05" max="0.15" step="0.005" value={logoScale} onChange={(event) => setLogoScale(Number(event.target.value))} /></label>
        <span className="position-hint"><LockKeyhole size={13} /> Artwork locked for editing</span>
      </div>
      {error && <p className="inline-error" role="alert">{error}</p>}
    </div>
  );
}

function PosterModule({ section, community, name, logo, adminMode, onTemplateUpload, onTemplateChange }) {
  const canvasRef = useRef(null);
  const renderVersion = useRef(0);
  const template = community?.templates?.[section.id];
  const [corner, setCorner] = useState(template?.brandPosition || "top-left");
  const [logoScale, setLogoScale] = useState(template?.logoScale || 0.085);
  const [error, setError] = useState("");
  const [downloadMessage, setDownloadMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setCorner(template?.brandPosition || "top-left");
    setLogoScale(template?.logoScale || 0.085);
  }, [community?.id, section.id, template?.brandPosition, template?.logoScale]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !template?.image) return undefined;
    const version = ++renderVersion.current;
    let active = true;
    setBusy(true);
    renderPoster(template, { name, logo, corner, logoScale })
      .then((rendered) => {
        if (!active || version !== renderVersion.current) return;
        canvas.width = rendered.width;
        canvas.height = rendered.height;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas preview is not supported by this browser.");
        context.drawImage(rendered, 0, 0);
        setError("");
        setBusy(false);
      })
      .catch((reason) => {
        if (!active || version !== renderVersion.current) return;
        setError(reason.message || "The poster preview could not be updated.");
        setBusy(false);
      });
    return () => { active = false; };
  }, [template, name, logo, corner, logoScale]);

  const uploadTemplate = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      validateImage(file);
      const image = await readImage(file);
      const { width, height } = await getImageDimensions(image);
      await onTemplateUpload(section.id, { image, width, height, isUploaded: true, brandPosition: corner, logoScale });
      setError("");
    } catch (reason) {
      setError(reason.message || "The template could not be saved.");
    }
  };

  const updatePosition = (nextCorner) => {
    setCorner(nextCorner);
    onTemplateChange(section.id, { brandPosition: nextCorner });
  };

  const updateLogoScale = (nextScale) => {
    setLogoScale(nextScale);
    onTemplateChange(section.id, { logoScale: nextScale });
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas || busy || error) {
      setError(error || "Wait for the latest preview to finish rendering.");
      return;
    }
    canvas.toBlob((blob) => {
      if (!blob) {
        setError("The poster could not be exported. Please try again.");
        return;
      }
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const communitySlug = (community?.name || "community").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      anchor.href = url;
      anchor.download = `${communitySlug}-${section.id}.png`;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setDownloadMessage("PNG downloaded");
      window.setTimeout(() => setDownloadMessage(""), 3000);
    }, "image/png");
  };

  return (
    <article className="poster-module" id={`module-${section.id}`}>
      <div className="module-heading">
        <span className="module-number">{section.number}</span>
        <div className="module-title"><h2>{section.title}</h2><p>{section.detail}</p></div>
        <span className="locked-badge"><LockKeyhole size={13} /> TEMPLATE LOCKED</span>
      </div>
      {adminMode && <TemplateUpload section={section} template={template} onUpload={uploadTemplate} corner={corner} setCorner={updatePosition} logoScale={logoScale} setLogoScale={updateLogoScale} error={error} />}
      <div className="module-preview-wrap">
        <div className="preview-canvas-wrap">
          <canvas ref={canvasRef} aria-label={`${section.title} live poster preview`} />
          {busy && <div className="preview-loading">Updating preview…</div>}
          {!template?.isUploaded && <span className="starter-badge"><ShieldCheck size={12} /> Starter artwork — upload your official design</span>}
        </div>
      </div>
      {error && !adminMode && <p className="inline-error" role="alert">{error}</p>}
      <div className="module-footer">
        <span className="preview-lock"><LockKeyhole size={14} /> Only name and logo are overlaid on the artwork.</span>
        <div className="download-actions">{downloadMessage && <span className="success-message"><Check size={14} />{downloadMessage}</span>}<button className="button button-dark" onClick={download} disabled={busy}><ArrowDownToLine size={16} /> Download PNG</button></div>
      </div>
    </article>
  );
}

export default function App() {
  const { communities, setCommunities, selectedCommunity, selectCommunity } = useCommunity();
  const [communityId, setCommunityId] = useState(selectedCommunity?.id || "");
  const [name, setName] = useState(selectedCommunity?.name || "");
  const [logo, setLogo] = useState(selectedCommunity?.logo || "");
  const [adminMode, setAdminMode] = useState(false);
  const [storageError, setStorageError] = useState("");
  const community = communities.find((entry) => entry.id === communityId) || communities[0] || null;

  useEffect(() => {
    if (!community) return;
    selectCommunity(community.id);
    setName(community.name || "");
    setLogo(community.logo || "");
  }, [community?.id]);

  const updateTemplate = (sectionId, patch) => {
    if (!community) return;
    const next = communities.map((entry) => entry.id === community.id
      ? { ...entry, templates: { ...entry.templates, [sectionId]: { ...entry.templates?.[sectionId], ...patch } } }
      : entry);
    try {
      setCommunities(next);
      setStorageError("");
    } catch (reason) {
      setStorageError(`Template update could not be saved in this browser: ${reason.message}`);
    }
  };

  const uploadTemplate = async (sectionId, template) => {
    if (!community) return;
    const next = communities.map((entry) => entry.id === community.id
      ? { ...entry, templates: { ...entry.templates, [sectionId]: { ...entry.templates?.[sectionId], ...template } } }
      : entry);
    setCommunities(next);
    setStorageError("");
  };

  const scrollToModule = (id) => document.getElementById(`module-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top"><span className="brand-symbol">C</span><span>Community Hub<small>POSTER STUDIO</small></span></a>
        <div className="topbar-controls">
          <label className="community-select"><UsersRound size={16} /><select value={community?.id || ""} onChange={(event) => { setCommunityId(event.target.value); selectCommunity(event.target.value); }} aria-label="Select community">
            {communities.map((entry) => <option value={entry.id} key={entry.id}>{entry.name}</option>)}
          </select><ChevronDown size={14} /></label>
          <label className="admin-toggle"><input type="checkbox" checked={adminMode} onChange={(event) => setAdminMode(event.target.checked)} /><Settings2 size={15} /><span>Admin templates</span></label>
        </div>
      </header>

      <main id="top">
        <section className="intro">
          <span className="eyebrow">ONE SIMPLE WORKFLOW · THREE POSTER MODULES</span>
          <h1>Your community.<br /><span>Your poster.</span></h1>
          <p>Choose your community, add its name and logo, then download a poster. Admins can upload a separate locked template for each module.</p>
          <div className="module-jump">{sections.map((section) => <button key={section.id} onClick={() => scrollToModule(section.id)}><span>{section.number}</span>{section.title}</button>)}</div>
        </section>

        <div className="content-grid">
          <div className="editor-column">
            {community ? <BrandFields name={name} setName={setName} logo={logo} setLogo={setLogo} error={storageError} setError={setStorageError} community={community} /> : <section className="brand-fields"><h2>Add a community first</h2><p>There are no local community profiles to select.</p></section>}
            {adminMode && <div className="admin-notice"><ShieldCheck size={17} /><span><strong>Admin template mode</strong> Uploads are stored only in this browser. This static app does not provide account authentication.</span></div>}
            {sections.map((section) => community && <PosterModule key={`${community.id}-${section.id}`} section={section} community={community} name={name} logo={logo} adminMode={adminMode} onTemplateUpload={uploadTemplate} onTemplateChange={updateTemplate} />)}
          </div>
          <aside className="side-note">
            <div className="side-note-icon"><LockKeyhole size={17} /></div>
            <h2>Design stays yours.</h2>
            <p>Your template is the locked background. Only the community name and logo are added on top, side by side.</p>
            <div className="side-note-rule" />
            <span>PRIVATE BY DEFAULT</span>
            <small>Templates and logos stay in this browser. Nothing is uploaded to a server.</small>
          </aside>
        </div>
      </main>
      <footer className="page-footer"><span>COMMUNITY HUB · POSTER STUDIO</span><a href="#top">Back to top ↑</a></footer>
    </div>
  );
}
