import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Route, Routes, useNavigate, useParams } from "react-router-dom";
import {
  ArrowDownToLine, ArrowRight, ArrowUpRight, BadgeCheck, BookOpen, Check, ChevronDown,
  CircleHelp, Clock3, FileImage, ImagePlus, LayoutDashboard, LockKeyhole, Menu, Plus,
  Search, Settings2, ShieldCheck, Sparkles, Upload, UsersRound, X,
} from "lucide-react";
import { categoryLabels, initialCommunities } from "./config/communityRegistry";
import { useCommunity } from "./context/CommunityContext";
import { renderPoster } from "./utils/posterRenderer";
import { clearLocalData } from "./utils/storage";

const categories = [
  { id: "collaboration", short: "Collaboration", number: "01", description: "Celebrate a project or event made possible by multiple communities.", icon: UsersRound },
  { id: "attendee", short: "Attendee intro", number: "02", description: "Put a face to the people learning, sharing, and showing up.", icon: ImagePlus },
  { id: "leads", short: "Leads & committee", number: "03", description: "Introduce the organizers and working committee behind your community.", icon: BadgeCheck },
];

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result));
  reader.onerror = () => reject(new Error("Could not read the selected file."));
  reader.readAsDataURL(file);
});

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand" aria-label="Community Hub home">
          <span className="brand-mark"><span /></span>
          <span>community<span className="brand-light">hub</span><small>POSTER STUDIO</small></span>
        </Link>
        <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X /> : <Menu />}</button>
        <nav className={menuOpen ? "main-nav open" : "main-nav"}>
          <NavLink to="/" onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/communities" onClick={() => setMenuOpen(false)}>Communities</NavLink>
          <a href="/#templates" onClick={() => setMenuOpen(false)}>Poster templates</a>
          <a href="/#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
          <a href="/#about" onClick={() => setMenuOpen(false)}>About</a>
        </nav>
        <Link className="button button-dark header-cta" to="/communities">Create your poster <ArrowUpRight size={16} /></Link>
      </div>
    </header>
  );
}

function Footer() {
  return <footer className="site-footer"><Link to="/" className="footer-brand">communityhub <span>Poster Studio</span></Link><span>One platform. Every community. One consistent identity.</span><Link to="/manage">Local template management <ArrowUpRight size={13} /></Link></footer>;
}

function PageShell({ children, className = "" }) {
  return <><Header /><main className={className}>{children}</main><Footer /></>;
}

function CommunityAvatar({ community, className = "" }) {
  return community.logo
    ? <img className={`community-avatar ${className}`} src={community.logo} alt={`${community.name} logo`} />
    : <span className={`community-avatar avatar-fallback ${className}`} style={{ "--avatar-color": community.brandColors?.[0] || "#5948d8" }}>{community.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</span>;
}

function CommunityCards({ communities, onSelect, compact = false }) {
  return <div className={compact ? "community-grid compact" : "community-grid"}>
    {communities.map((community, index) => (
      <article className="community-card" key={community.id}>
        <div className="community-card-top"><CommunityAvatar community={community} /><span className="card-index">COMMUNITY {String(index + 1).padStart(2, "0")}</span></div>
        <h3>{community.name}</h3>
        <p>{community.description}</p>
        <div className="card-bottom"><span className="template-count"><span className="status-dot" />{Object.keys(community.templates || {}).length} official templates</span>
          <button className="text-button" onClick={() => onSelect(community)}>Select community <ArrowRight size={15} /></button>
        </div>
      </article>
    ))}
  </div>;
}

function Home() {
  const { communities, selectCommunity } = useCommunity();
  const navigate = useNavigate();
  const select = (community) => { selectCommunity(community.id); navigate(`/community/${community.id}`); };
  return <PageShell>
    <section className="hero">
      <div className="hero-content">
        <span className="eyebrow"><span className="eyebrow-line" /> A SHARED SPACE FOR EVERY COMMUNITY</span>
        <h1>Your community.<br />Your identity.<br /><span>Your poster.</span></h1>
        <p>A centralized studio to create professional, on-brand posters. Bring your people and communities into the spotlight with approved templates made to keep every identity intact.</p>
        <div className="hero-actions"><Link className="button button-dark" to="/communities">Create your poster <ArrowRight size={16} /></Link><a className="button button-quiet" href="#how-it-works">See how it works <ArrowDownToLine size={15} /></a></div>
        <div className="hero-proof"><span className="proof-avatars">{communities.slice(0, 3).map((community) => <CommunityAvatar key={community.id} community={community} />)}</span><span><strong>{communities.length} communities</strong><br />one shared creative space</span><span className="proof-separator" /><span><LockKeyhole size={15} /> Templates stay protected</span></div>
      </div>
      <div className="hero-art" aria-label="Poster template examples">
        <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
        <div className="poster-stack poster-back"><div className="poster-back-mark">CH</div><span>COMMUNITY<br />COLLABORATION</span><i /></div>
        <div className="poster-stack poster-mid"><div className="poster-mid-circle">01</div><span>THE PEOPLE<br />BEHIND THE IDEAS</span></div>
        <div className="poster-stack poster-front"><div className="poster-label">COMMUNITY SPOTLIGHT <span>2025</span></div><div className="poster-headline">Better<br />together.</div><div className="poster-rule" /><div className="poster-footer"><span>ONE COMMUNITY<br />AT A TIME</span><span className="poster-dot-grid">•••<br />•••<br />•••</span></div></div>
        <div className="art-note"><span className="note-icon"><ShieldCheck size={17} /></span><span><strong>Official templates</strong><small>Always on-brand</small></span><Check className="note-check" size={16} /></div>
        <div className="art-caption">A canvas for every community.</div>
      </div>
      <div className="hero-bottom-line"><span>01 — SELECT YOUR COMMUNITY</span><span>SCROLL TO EXPLORE ↓</span></div>
    </section>

    <section className="section community-section" id="communities">
      <div className="section-heading"><div><span className="eyebrow">YOUR PEOPLE, YOUR PLACE</span><h2>Made for communities<br />of every kind.</h2></div><div className="section-aside"><p>One shared portal, with a dedicated identity and approved templates for every participating community.</p><Link className="arrow-link" to="/communities">Explore all communities <ArrowRight size={16} /></Link></div></div>
      {communities.length ? <CommunityCards communities={communities.slice(0, 3)} onSelect={select} compact /> : <EmptyState title="No communities yet" text="Add a community in local template management to get started." />}
      <div className="community-section-foot"><span>NEUTRAL BY DESIGN <span className="foot-dot" /> BUILT FOR EVERY COMMUNITY</span><Link to="/manage">Manage local communities <ArrowUpRight size={14} /></Link></div>
    </section>

    <section className="section template-section" id="templates">
      <div className="section-heading"><div><span className="eyebrow">THREE WAYS TO TELL YOUR STORY</span><h2>One studio.<br />Three poster types.</h2></div><p className="heading-summary">Every poster starts with an official template. Your community controls its look; you only fill in the fields that belong to you.</p></div>
      <div className="category-grid">{categories.map(({ id, short, number, description, icon: Icon }) => <article className={`category-card category-${id}`} key={id}><div className="category-card-meta"><span>{number} / POSTER TYPE</span><Icon size={20} /></div><div className="category-visual"><div className="mini-poster"><div className="mini-poster-top" /><div className="mini-poster-shape" /><div className="mini-poster-lines"><i /><i /><i /></div></div><span className="visual-tag">{id === "collaboration" ? "TOGETHER" : id === "attendee" ? "INTRODUCING" : "THE TEAM"}</span></div><h3>{short}</h3><p>{description}</p><Link to="/communities" className="card-link">Choose a community <ArrowRight size={15} /></Link></article>)}</div>
    </section>

    <section className="workflow-section" id="how-it-works"><div className="workflow-title"><span className="eyebrow">SIMPLE BY DESIGN</span><h2>From community<br />to canvas.</h2><p>No design tools to learn. Just choose your community, add your details, and download a polished poster.</p><Link className="button button-white" to="/communities">Get started <ArrowRight size={16} /></Link></div><div className="workflow-list">{[["01", "Choose your community", "Start with the right identity and approved templates."], ["02", "Pick a poster type", "Choose collaboration, attendee, or committee."], ["03", "Add your details", "Only the permitted fields are editable."], ["04", "Download & share", "Export your finished poster as a high-resolution PNG."]].map(([number, title, copy]) => <div className="workflow-step" key={number}><span className="workflow-number">{number}</span><div><h3>{title}</h3><p>{copy}</p></div><ArrowUpRight size={17} /></div>)}</div></section>
    <section className="closing-section" id="about"><span className="closing-flower">✳</span><span className="eyebrow">ONE PLATFORM. EVERY COMMUNITY.</span><h2>Make something that<br />feels like <em>yours.</em></h2><Link to="/communities" className="button button-dark">Find your community <ArrowRight size={16} /></Link></section>
  </PageShell>;
}

function Communities() {
  const { communities, selectCommunity } = useCommunity();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const filtered = communities.filter((community) => `${community.name} ${community.description}`.toLowerCase().includes(query.toLowerCase()));
  const select = (community) => { selectCommunity(community.id); navigate(`/community/${community.id}`); };
  return <PageShell className="subpage">
    <div className="page-intro"><span className="eyebrow">THE COMMUNITY DIRECTORY</span><h1>Find your community.</h1><p>Every community has its own identity, its own templates, and its own place here.</p></div>
    <div className="directory-toolbar"><span>{communities.length} communities in the studio</span><label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search communities" aria-label="Search communities" />{query && <button onClick={() => setQuery("")} aria-label="Clear search"><X size={15} /></button>}</label></div>
    {filtered.length ? <CommunityCards communities={filtered} onSelect={select} /> : <EmptyState title="No communities found" text="Try another search, or add a community in local template management." />}
    <div className="local-note"><LockKeyhole size={17} /><span><strong>Local to this browser</strong> Community and template updates made here are not shared with other users.</span><Link to="/manage">Manage communities <ArrowRight size={14} /></Link></div>
  </PageShell>;
}

function EmptyState({ title, text }) {
  return <div className="empty-state"><span className="empty-icon"><UsersRound size={20} /></span><h3>{title}</h3><p>{text}</p></div>;
}

function CommunityDashboard() {
  const { id } = useParams();
  const { communities, history, selectCommunity } = useCommunity();
  const community = communities.find((entry) => entry.id === id);
  const navigate = useNavigate();
  useEffect(() => { if (community) selectCommunity(community.id); }, [community?.id]);
  if (!community) return <PageShell className="subpage"><EmptyState title="Community not found" text="Choose a community from the directory." /><Link to="/communities" className="button button-dark">Browse communities</Link></PageShell>;
  const recent = history.filter((entry) => entry.communityId === community.id);
  return <PageShell className="subpage">
    <div className="breadcrumb"><Link to="/communities">Communities</Link><span>/</span><span>{community.name}</span></div>
    <section className="dashboard-hero"><div><span className="eyebrow">YOUR COMMUNITY STUDIO</span><div className="dashboard-title"><CommunityAvatar community={community} /><h1>{community.name}</h1></div><p>{community.description}</p><div className="dashboard-links">{community.website && <a href={community.website} target="_blank" rel="noreferrer">Website <ArrowUpRight size={13} /></a>}{community.linkedin && <a href={community.linkedin} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={13} /></a>}{community.instagram && <a href={community.instagram} target="_blank" rel="noreferrer">Instagram <ArrowUpRight size={13} /></a>}</div></div><button className="button button-quiet" onClick={() => navigate("/communities")}>Switch community <ChevronDown size={16} /></button></section>
    <div className="dashboard-section-heading"><div><span className="eyebrow">OFFICIAL POSTER TEMPLATES</span><h2>What are you creating?</h2></div><span className="locked-label"><LockKeyhole size={14} /> DESIGN LOCKED</span></div>
    <div className="dashboard-categories">{categories.map(({ id: category, short, description, number, icon: Icon }) => <button className="dashboard-category" key={category} onClick={() => navigate(`/create/${community.id}/${category}`)}><span className="dashboard-cat-number">{number} / {(community.templateVariants?.[category]?.length || 0) + (community.templates?.[category] ? 1 : 0)} APPROVED DESIGNS</span><span className="dashboard-cat-icon"><Icon size={19} /></span><h3>{short}</h3><p>{description}</p><span className="dashboard-cat-link">Customize poster <ArrowRight size={15} /></span></button>)}</div>
    <section className="recent-section"><div className="recent-heading"><div><span className="eyebrow">ON THIS DEVICE</span><h2>Recently downloaded</h2></div><span className="muted-caption"><Clock3 size={14} /> Local history only</span></div>{recent.length ? <div className="history-list">{recent.slice(0, 4).map((entry) => <div className="history-row" key={entry.id}><span className="history-icon"><FileImage size={17} /></span><span><strong>{entry.fileName}</strong><small>{categoryLabels[entry.category]} · {new Date(entry.createdAt).toLocaleDateString()}</small></span><span className="history-status"><Check size={14} /> Downloaded</span></div>)}</div> : <p className="history-empty">Your downloaded posters will appear here. This history stays on this device.</p>}</section>
  </PageShell>;
}

function validateImage(file) {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) throw new Error("Choose a JPG, PNG, or WebP image.");
  if (file.size > 6 * 1024 * 1024) throw new Error("Images must be smaller than 6 MB.");
}

function PosterEditor() {
  const { communityId, category } = useParams();
  const { communities, recordPoster, selectCommunity } = useCommunity();
  const community = communities.find((entry) => entry.id === communityId);
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const renderId = useRef(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState("");
  const [logo, setLogo] = useState("");
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [renderError, setRenderError] = useState("");
  const [activeTemplateId, setActiveTemplateId] = useState("");
  const templateOptions = community?.templates?.[category]
    ? [community.templates[category], ...(community.templateVariants?.[category] || [])]
    : [];
  const template = templateOptions.find((entry) => entry.id === activeTemplateId) || templateOptions[0];

  useEffect(() => { if (community) selectCommunity(community.id); }, [community?.id]);
  useEffect(() => { setActiveTemplateId(""); }, [communityId, category]);
  useEffect(() => {
    if (!template || !canvasRef.current) return undefined;
    const current = ++renderId.current;
    renderPoster(canvasRef.current, template, category, { name, description, photo, logo, zoom, offsetX, offsetY })
      .then(() => { if (current === renderId.current) setRenderError(""); })
      .catch((reason) => { if (current === renderId.current) setRenderError(reason.message); });
    return () => { renderId.current += 1; };
  }, [template, category, name, description, photo, logo, zoom, offsetX, offsetY]);

  if (!community || !categories.some((entry) => entry.id === category) || !template) return <PageShell className="subpage"><EmptyState title="Template unavailable" text="This community does not have an approved template for that poster type." /><Link to={community ? `/community/${community.id}` : "/communities"} className="button button-dark">Back to templates</Link></PageShell>;

  const upload = async (event, setter) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try { validateImage(file); setter(await fileToDataUrl(file)); setError(""); }
    catch (reason) { setError(reason.message); }
  };
  const saveDownload = () => new Promise((resolve, reject) => {
    const canvas = canvasRef.current;
    if (!canvas || renderError) { reject(new Error(renderError || "Poster preview is not ready.")); return; }
    if ((category === "collaboration" || category === "leads") && !name.trim()) {
      reject(new Error(category === "collaboration" ? "Enter the collaborating community name before downloading." : "Enter the community name before downloading."));
      return;
    }
    canvas.toBlob((blob) => {
      if (!blob) { reject(new Error("The browser could not export this poster.")); return; }
      const cleanCommunity = community.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const filename = `${cleanCommunity}-${category === "leads" ? "lead" : category}.png`;
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      recordPoster({ communityId: community.id, category, fileName: filename });
      setNotice("Your poster is ready and downloaded.");
      window.setTimeout(() => setNotice(""), 3800);
      resolve();
    }, "image/png");
  });
  const reset = () => { setName(""); setDescription(""); setPhoto(""); setLogo(""); setZoom(1); setOffsetX(0); setOffsetY(0); setError(""); };
  return <PageShell className="subpage editor-page">
    <div className="breadcrumb"><Link to={`/community/${community.id}`}>{community.name}</Link><span>/</span><span>{categoryLabels[category]}</span></div>
    <div className="editor-heading"><div><span className="eyebrow">POSTER STUDIO / {category.toUpperCase()}</span><h1>Make it yours.</h1><p>Your approved design is locked. Add only the details this poster is made for.</p></div><div className="editor-community-chip"><CommunityAvatar community={community} /><span><small>CREATING FOR</small><strong>{community.name}</strong></span></div></div>
    <div className="editor-layout">
      <section className="editor-panel">
        <div className="panel-title"><span>01</span><div><h2>Your details</h2><p>Only permitted fields can be edited.</p></div></div>
        {templateOptions.length > 1 && <label className="template-choice"><span>Approved template</span><select value={template.id} onChange={(event) => setActiveTemplateId(event.target.value)}>{templateOptions.map((option, index) => <option value={option.id} key={option.id}>{option.name || `Template ${index + 1}`}</option>)}</select></label>}
        {category === "collaboration" && <>
          <label className="form-label">Collaborating community name <span>REQUIRED</span></label><input className="text-input" value={name} onChange={(event) => setName(event.target.value.slice(0, 70))} placeholder="e.g. Design Systems Chennai" maxLength={70} />
          <div className="upload-field"><label className="form-label">Collaborating community logo <small>JPG, PNG or WebP · up to 6 MB</small></label><label className="upload-zone">{logo ? <img src={logo} alt="Uploaded community logo" /> : <span className="upload-placeholder"><Upload size={19} />Choose a logo</span>}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => upload(event, setLogo)} /></label>{logo && <button className="remove-button" onClick={() => setLogo("")}>Remove logo <X size={13} /></button>}</div>
        </>}
        {category === "attendee" && <>
          <div className="upload-field"><label className="form-label">Attendee photograph <span>OPTIONAL</span><small>JPG, PNG or WebP · up to 6 MB</small></label><label className="upload-zone photo-upload">{photo ? <img src={photo} alt="Attendee photo preview" /> : <span className="upload-placeholder"><ImagePlus size={19} />Upload photograph</span>}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => upload(event, setPhoto)} /></label>{photo && <button className="remove-button" onClick={() => setPhoto("")}>Remove photo <X size={13} /></button>}</div>
          {template.editableFields.attendeeName?.enabled && <><label className="form-label">Attendee name</label><input className="text-input" value={name} onChange={(event) => setName(event.target.value.slice(0, 50))} placeholder="Enter attendee name" maxLength={50} /></>}
        </>}
        {category === "leads" && <>
          <div className="upload-field"><label className="form-label">Lead photograph <span>OPTIONAL</span><small>JPG, PNG or WebP · up to 6 MB</small></label><label className="upload-zone photo-upload">{photo ? <img src={photo} alt="Lead photo preview" /> : <span className="upload-placeholder"><ImagePlus size={19} />Upload photograph</span>}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => upload(event, setPhoto)} /></label>{photo && <button className="remove-button" onClick={() => setPhoto("")}>Remove photo <X size={13} /></button>}</div>
          <label className="form-label">Community name <span>REQUIRED</span></label><input className="text-input" value={name} onChange={(event) => setName(event.target.value.slice(0, 60))} placeholder={community.name} maxLength={60} />
          <label className="form-label">Community description <span>{description.length}/180</span></label><textarea className="text-input text-area" value={description} onChange={(event) => setDescription(event.target.value.slice(0, 180))} placeholder="A short introduction to your community…" maxLength={180} rows={4} />
        </>}
        {(category === "attendee" || category === "leads") && photo && <div className="crop-controls"><div className="crop-heading"><span><Settings2 size={15} /> Adjust photo</span><button onClick={() => { setZoom(1); setOffsetX(0); setOffsetY(0); }}>Reset</button></div><label>Zoom <input type="range" min="1" max="2.5" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} /><span>{zoom.toFixed(1)}×</span></label><label>Horizontal <input type="range" min="-0.5" max="0.5" step="0.01" value={offsetX} onChange={(event) => setOffsetX(Number(event.target.value))} /></label><label>Vertical <input type="range" min="-0.5" max="0.5" step="0.01" value={offsetY} onChange={(event) => setOffsetY(Number(event.target.value))} /></label><p>Drag-free positioning controls keep your photo inside the fixed placeholder.</p></div>}
        {error && <div className="error-message" role="alert">{error}</div>}
        <div className="editor-panel-foot"><button className="button button-outline" onClick={reset}>Reset fields</button><span><LockKeyhole size={13} /> Template design is locked</span></div>
      </section>
      <section className="preview-panel">
        <div className="preview-toolbar"><div><span className="panel-kicker">02 / LIVE PREVIEW</span><strong>{categoryLabels[category]}</strong></div><span className="preview-dimensions">{template.originalWidth} × {template.originalHeight}</span></div>
        <div className="poster-preview"><canvas ref={canvasRef} aria-label={`${categoryLabels[category]} poster preview`} /></div>
        {renderError && <p className="error-message" role="alert">{renderError}</p>}
        <div className="preview-foot"><span><LockKeyhole size={14} /> Original design protected</span><button className="button button-dark download-button" disabled={Boolean(renderError)} onClick={() => saveDownload().catch((reason) => setError(reason.message))}><ArrowDownToLine size={16} /> Download PNG</button></div>
        <p className="export-note">Full-size PNG export · {template.originalWidth} × {template.originalHeight}px</p>
      </section>
    </div>
    {notice && <div className="toast"><Check size={17} />{notice}<button onClick={() => setNotice("")} aria-label="Dismiss notification"><X size={15} /></button></div>}
  </PageShell>;
}

function TemplateManagement() {
  const { communities, setCommunities } = useCommunity();
  const [selectedId, setSelectedId] = useState(communities[0]?.id || "");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const selected = communities.find((community) => community.id === selectedId);
  const importRef = useRef(null);
  const patchCommunity = (patch) => {
    try { setCommunities(communities.map((community) => community.id === selectedId ? { ...community, ...patch } : community)); setError(""); }
    catch (reason) { setError(`Could not save this change in browser storage: ${reason.message}`); }
  };
  const patchTemplate = (category, patch) => {
    if (!selected) return;
    patchCommunity({ templates: { ...selected.templates, [category]: { ...selected.templates[category], ...patch } } });
  };
  const updateField = (category, key, prop, value, templateId = "") => {
    if (!templateId) {
      const template = selected.templates[category];
      patchTemplate(category, { editableFields: { ...template.editableFields, [key]: { ...template.editableFields[key], [prop]: value } } });
      return;
    }
    const variants = selected.templateVariants?.[category] || [];
    patchCommunity({ templateVariants: { ...selected.templateVariants, [category]: variants.map((template) => template.id === templateId
      ? { ...template, editableFields: { ...template.editableFields, [key]: { ...template.editableFields[key], [prop]: value } } }
      : template) } });
  };
  const handleUpload = async (event, callback) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try { validateImage(file); callback(await fileToDataUrl(file)); setError(""); }
    catch (reason) { setError(reason.message); }
  };
  const addCommunity = () => {
    const id = `community-${crypto.randomUUID()}`;
    const templateSource = initialCommunities[0];
    const newCommunity = { ...templateSource, id, name: "New community", description: "Add a short description for this community.", logo: "", brandColors: ["#5948d8", "#8c68df"], templates: JSON.parse(JSON.stringify(templateSource.templates)) };
    newCommunity.templates = Object.fromEntries(Object.entries(newCommunity.templates).map(([category, template]) => [category, { ...template, id: `${category}-${id}`, communityId: id }]));
    try { setCommunities([...communities, newCommunity]); setSelectedId(id); setNotice("Community added. Update its profile and approved templates."); setError(""); }
    catch (reason) { setError(`Could not add community: ${reason.message}`); }
  };
  const exportConfig = () => {
    try {
      const blob = new Blob([JSON.stringify({ version: 1, communities }, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a"); link.href = url; link.download = "community-hub-configuration.json"; link.click(); URL.revokeObjectURL(url);
      setNotice("Community configuration exported.");
    } catch (reason) { setError(`Could not export configuration: ${reason.message}`); }
  };
  const importConfig = async (event) => {
    const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
    try {
      if (file.size > 15 * 1024 * 1024) throw new Error("Configuration file must be smaller than 15 MB.");
      const data = JSON.parse(await file.text());
      const next = Array.isArray(data) ? data : data.communities;
      if (!Array.isArray(next) || !next.every((community) => community.id && community.name && community.templates)) throw new Error("This file is not a valid Community Hub configuration.");
      setCommunities(next); setSelectedId(next[0]?.id || ""); setError(""); setNotice("Configuration imported on this device.");
    } catch (reason) { setError(`Could not import configuration: ${reason.message}`); }
  };
  const resetLocal = () => {
    if (!window.confirm("Reset this browser's communities and poster history to the sample configuration?")) return;
    clearLocalData();
    setCommunities(initialCommunities);
    setSelectedId(initialCommunities[0]?.id || "");
    setNotice("Local data reset to the sample configuration.");
  };
  const removeCommunity = () => {
    if (!selected || !window.confirm(`Remove ${selected.name} from this browser?`)) return;
    const next = communities.filter((community) => community.id !== selectedId);
    setCommunities(next); setSelectedId(next[0]?.id || ""); setNotice("Community removed from this device.");
  };
  return <PageShell className="subpage management-page">
    <div className="breadcrumb"><Link to="/">Home</Link><span>/</span><span>Local template management</span></div>
    <div className="page-intro manage-intro"><span className="eyebrow">FOR PORTAL MAINTAINERS</span><h1>Community settings.</h1><p>Manage your profiles and approved poster templates for this browser.</p></div>
    <div className="local-warning"><LockKeyhole size={19} /><div><strong>These changes are local to this browser.</strong><p>There is no backend or shared account. Other users will not see communities or templates you add here. Export a configuration file to move these settings between your own devices.</p></div></div>
    <div className="manage-toolbar"><label className="select-wrap"><span>Community</span><select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>{communities.map((community) => <option value={community.id} key={community.id}>{community.name}</option>)}</select></label><button className="button button-dark" onClick={addCommunity}><Plus size={16} /> Add community</button><button className="button button-outline" onClick={exportConfig}><ArrowDownToLine size={15} /> Export JSON</button><button className="button button-outline" onClick={() => importRef.current?.click()}><Upload size={15} /> Import JSON</button><input ref={importRef} className="visually-hidden" type="file" accept="application/json,.json" onChange={importConfig} /></div>
    {selected && <div className="manage-content">
      <section className="manage-card"><div className="manage-card-heading"><div><span className="eyebrow">01 / PROFILE</span><h2>Community identity</h2></div><button className="danger-link" onClick={removeCommunity}>Remove community</button></div>
        <div className="profile-form-grid"><div><label className="form-label">Community name</label><input className="text-input" value={selected.name} onChange={(event) => patchCommunity({ name: event.target.value.slice(0, 80) })} maxLength={80} /><label className="form-label">Description</label><textarea className="text-input text-area" value={selected.description} onChange={(event) => patchCommunity({ description: event.target.value.slice(0, 300) })} maxLength={300} rows={3} /><div className="profile-url-row"><label><span>Website</span><input value={selected.website || ""} onChange={(event) => patchCommunity({ website: event.target.value })} placeholder="https://" /></label><label><span>LinkedIn</span><input value={selected.linkedin || ""} onChange={(event) => patchCommunity({ linkedin: event.target.value })} placeholder="https://" /></label></div></div><div className="profile-logo-box"><CommunityAvatar community={selected} /><label className="button button-outline logo-upload-button"><Upload size={14} /> Upload logo<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => handleUpload(event, (logo) => patchCommunity({ logo }))} /></label><small>Square logo recommended · up to 6 MB</small>{selected.logo && <button className="remove-button" onClick={() => patchCommunity({ logo: "" })}>Remove logo</button>}</div></div>
      </section>
      <section className="manage-card"><div className="manage-card-heading"><div><span className="eyebrow">02 / APPROVED ARTWORK</span><h2>Poster templates</h2></div><span className="locked-label"><LockKeyhole size={14} /> OVERLAYS ONLY</span></div><p className="manage-description">Each category can have multiple approved designs. Add or replace artwork here; the shared editor lets everyone choose from the selected community's templates. Editable overlays use normalized coordinates (0–1).</p>
        <div className="template-manage-grid">{categories.map(({ id, short }) => {
          const template = selected.templates?.[id];
          const variants = selected.templateVariants?.[id] || [];
          const handleArtwork = (event, onLoaded) => handleUpload(event, (image) => {
            const imageEl = new Image();
            imageEl.onload = () => onLoaded(image, imageEl.naturalWidth, imageEl.naturalHeight);
            imageEl.onerror = () => setError("The selected artwork could not be decoded.");
            imageEl.src = image;
          });
          return <article className="template-manage-card" key={id}>
            <div className="template-thumb"><img src={template?.image} alt={`${short} template preview`} /></div>
            <div className="template-manage-info"><div><h3>{short} · Default</h3><small>{template?.originalWidth} × {template?.originalHeight}px</small></div><label className="button button-outline replace-button"><Upload size={14} /> Replace artwork<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => handleArtwork(event, (image, width, height) => patchTemplate(id, { image, originalWidth: width, originalHeight: height }))} /></label></div>
            <div className="field-settings">{Object.entries(template?.editableFields || {}).map(([key, config]) => <div className="field-setting" key={key}><label><input type="checkbox" checked={Boolean(config.enabled)} onChange={(event) => updateField(id, key, "enabled", event.target.checked)} />{key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase())}</label><div className="coordinate-inputs">{["x", "y", "width", "height", "maxWidth", "maxHeight"].filter((field) => config[field] !== undefined).map((field) => <label key={field}>{field}<input type="number" min="0" max="1" step="0.01" value={config[field]} onChange={(event) => updateField(id, key, field, Math.min(1, Math.max(0, Number(event.target.value))))} /></label>)}</div></div>)}</div>
            {variants.map((variant, index) => (
              <div className="extra-template" key={variant.id}>
                <div className="template-thumb"><img src={variant.image} alt={`${short} additional template ${index + 1}`} /></div>
                <div className="extra-template-content">
                  <div className="extra-template-controls">
                    <input className="text-input" value={variant.name || `Template ${index + 2}`} aria-label={`${short} template name`} onChange={(event) => {
                      const nextVariants = variants.map((entry) => entry.id === variant.id ? { ...entry, name: event.target.value.slice(0, 40) } : entry);
                      patchCommunity({ templateVariants: { ...selected.templateVariants, [id]: nextVariants } });
                    }} />
                    <small>{variant.originalWidth} × {variant.originalHeight}px</small>
                    <label className="button button-outline replace-button"><Upload size={14} /> Replace<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => handleArtwork(event, (image, width, height) => {
                      const nextVariants = variants.map((entry) => entry.id === variant.id ? { ...entry, image, originalWidth: width, originalHeight: height } : entry);
                      patchCommunity({ templateVariants: { ...selected.templateVariants, [id]: nextVariants } });
                    })} /></label>
                    <button className="danger-link" onClick={() => patchCommunity({ templateVariants: { ...selected.templateVariants, [id]: variants.filter((entry) => entry.id !== variant.id) } })}>Remove</button>
                  </div>
                  <div className="field-settings">{Object.entries(variant.editableFields || {}).map(([key, config]) => (
                    <div className="field-setting" key={key}>
                      <label><input type="checkbox" checked={Boolean(config.enabled)} onChange={(event) => updateField(id, key, "enabled", event.target.checked, variant.id)} />{key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase())}</label>
                      <div className="coordinate-inputs">{["x", "y", "width", "height", "maxWidth", "maxHeight"].filter((field) => config[field] !== undefined).map((field) => (
                        <label key={field}>{field}<input type="number" min="0" max="1" step="0.01" value={config[field]} onChange={(event) => updateField(id, key, field, Math.min(1, Math.max(0, Number(event.target.value))), variant.id)} /></label>
                      ))}</div>
                    </div>
                  ))}</div>
                </div>
              </div>
            ))}
            <label className="button button-outline add-template-button"><Plus size={14} /> Add {short.toLowerCase()} template<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => handleArtwork(event, (image, width, height) => {
              const nextVariants = [...variants, { ...template, id: `${id}-${crypto.randomUUID()}`, name: `Template ${variants.length + 2}`, image, originalWidth: width, originalHeight: height, editableFields: JSON.parse(JSON.stringify(template.editableFields || {})) }];
              patchCommunity({ templateVariants: { ...selected.templateVariants, [id]: nextVariants } });
            })} /></label>
          </article>;
        })}</div>
      </section>
    </div>}
    {error && <div className="error-message manage-error" role="alert">{error}</div>}
    {notice && <div className="notice-message"><Check size={15} />{notice}<button onClick={() => setNotice("")} aria-label="Dismiss notification"><X size={14} /></button></div>}
    <div className="manage-bottom"><p><ShieldCheck size={16} /> Uploaded images are processed in this browser. Poster photos are not saved to local history.</p><button className="text-button muted-text" onClick={resetLocal}>Reset local data</button></div>
  </PageShell>;
}

function NotFound() {
  return <PageShell className="subpage"><EmptyState title="This page isn't here" text="The link may have changed, or the page may not exist." /><Link className="button button-dark" to="/">Back to home <ArrowRight size={16} /></Link></PageShell>;
}

export default function App() {
  return <Routes><Route path="/" element={<Home />} /><Route path="/communities" element={<Communities />} /><Route path="/community/:id" element={<CommunityDashboard />} /><Route path="/create/:communityId/:category" element={<PosterEditor />} /><Route path="/manage" element={<TemplateManagement />} /><Route path="*" element={<NotFound />} /></Routes>;
}
