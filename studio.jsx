const { useState, useMemo, useEffect, useRef } = React;

// ---------- Data ----------
const NEWSLETTER_TYPES = [
  "Insight / Analysis","Weekly Digest","Deep Dive","Market Brief",
  "Competitive Intelligence","Founder Note","Executive Brief",
  "Trend Report","Curated Roundup","Thought Leadership Essay",
];
const AUDIENCES = [
  "Enterprise Leaders","Marketing Executives","Founders","Product Leaders",
  "AI Teams","Data & Analytics Leaders","Consultants","Agency Strategists",
  "Investors","General Business Readers",
];
const TONES = [
  "Boardroom-ready, analytical","Sharp and opinionated","Educational and practical",
  "Premium newsletter","Founder-style, conversational","Consulting-style, structured",
  "Data-driven and objective","Bold and provocative","Calm and authoritative",
  "Simple and accessible",
];
const LENGTHS = [
  "Short · 400–600 words","Medium · 800–1,000 words","Long · 1,500+ words",
  "Executive summary · 300–500 words","Deep report · 2,000+ words",
];

const ACTIVE_SOURCES = [
  { id:"web", label:"Web Search", icon:"globe" },
  { id:"news", label:"News", icon:"news" },
  { id:"pdfs", label:"PDFs", icon:"pdf" },
  { id:"blogs", label:"Company Blogs", icon:"blog" },
];
const LOCKED_SOURCES = [
  { id:"linkedin", label:"LinkedIn", icon:"linkedin" },
  { id:"twitter", label:"X / Twitter", icon:"twitter" },
  { id:"podcasts", label:"Podcasts", icon:"mic" },
  { id:"youtube", label:"YouTube", icon:"play" },
];

const SOURCE_CARDS = [
  { id:"e", title:"Enterprise AI Study 2025", domain:"gartner.com", color:"#2D6FE0", letter:"E" },
  { id:"mc", title:"AI Overviews Impact Report", domain:"mckinsey.com", color:"#1B3A57", letter:"Mc" },
  { id:"b", title:"Generative Search Brief", domain:"bcg.com", color:"#0E6A47", letter:"B" },
  { id:"o", title:"OpenAI Search & Discovery Notes", domain:"openai.com", color:"#0F0F0F", letter:"◈" },
  { id:"st", title:"Strategic Tech Trends", domain:"deloitte.com", color:"#0E4A2F", letter:"ST" },
  { id:"wsj", title:"State of AI in Enterprise", domain:"wsj.com", color:"#1E1E1E", letter:"WSJ" },
];

const RECENT_ISSUES = [
  { title:"AI Search Visibility: The Enterprise Playbook", date:"May 12, 2025", words:"920 words", status:"Published", icon:"trend" },
  { title:"State of Generative Search in 2026", date:"May 6, 2025", words:"1,135 words", status:"Draft", icon:"doc" },
  { title:"B2B Content Strategy for AI Discovery", date:"Apr 28, 2025", words:"865 words", status:"Review", icon:"people" },
];

const SUBJECT_OPTIONS = [
  "The enterprise playbook for AI search visibility",
  "Win visibility in AI search. Here's how.",
  "AI search visibility: What leaders must do in 2026",
  "Your brand's next search problem is not Google",
  "How enterprise brands show up in AI answers",
];

const PREVIEW_BY_SUBJECT = {
  0: "Practical frameworks and metrics to help enterprise marketing teams earn inclusion in AI search and drive measurable impact.",
  1: "A practical guide to improving how your brand appears in AI-generated answers.",
  2: "What enterprise marketers need to know about search, citations, and answer-engine visibility.",
  3: "The shift from rankings to AI answers is already underway. Here's how to prepare.",
  4: "How leading B2B brands are earning citations and inclusion across answer engines.",
};

const DRAFT_DEFAULTS = {
  hook: "AI search is reshaping how executives discover, evaluate, and decide. Here's what marketing leaders need to know to stay visible—and chosen.",
  body: "We break down the shift to answer-engine discovery, the signals that drive inclusion, and the metrics that reveal true visibility in AI experiences.",
  takeaways: "Three imperatives for enterprise brands—and the frameworks to turn visibility into measurable business impact.",
  cta: "Put this playbook into action. Align your team, audit your content, and start measuring what matters in AI-driven discovery.",
};

const REWRITES = {
  hook: {
    "Rewrite Intro": "Search is no longer a ranked list—it's a generated answer. The enterprises that show up inside those answers will own the next decade of B2B discovery.",
    "Add Data": "73% of enterprise buyers now consult an AI assistant before talking to sales. The window to be cited—not just ranked—is closing fast.",
    "Make Sharper": "Answer engines decide what executives see. If your brand isn't cited, you're invisible.",
    "Make More Executive": "AI-driven discovery is now a board-level visibility risk. Here's the executive framework to address it.",
  },
  body: {
    "Make Sharper": "Inclusion in AI answers comes down to three things: trusted entities, dense citations, and topical authority. Miss any one and you disappear.",
    "Expand": "We break down the shift to answer-engine discovery, the entity signals that drive inclusion, the citation patterns answer engines reward, the role of authoritative sourcing in long-tail queries, and the measurement framework that reveals true visibility across AI experiences and copilots.",
    "Add Examples": "We break down the shift—Gartner now reports 40% of B2B research begins inside an AI assistant—and walk through the signals (entity coverage, citation density, source authority) that decide inclusion.",
    "Add Source": "Per BCG's Generative Search Brief, share-of-answer is overtaking share-of-voice as the leading visibility metric for enterprise brands.",
    "Simplify": "AI tools answer questions for buyers. To be in those answers, your brand needs trusted content, real citations, and clear topical depth.",
  },
  takeaways: {
    "Shorten": "Three imperatives: structure, cite, measure.",
    "Add Examples": "Three imperatives: build entity-rich content (like Stripe's docs), earn third-party citations (the Gartner playbook), and measure share-of-answer weekly.",
    "Make Tactical": "Audit entity coverage. Earn three new third-party citations per quarter. Track share-of-answer weekly. Report quarterly to leadership.",
    "Make Executive": "Three board-level imperatives: govern brand entities, fund authoritative content, instrument share-of-answer as a primary growth metric.",
  },
  cta: {
    "Make Bolder": "Stop optimizing for rankings that no longer matter. Start engineering for inclusion in the answers your buyers actually read.",
    "Shorten": "Audit your visibility. Measure what matters. Start now.",
    "Add CTA": "Download the Enterprise AI Visibility Audit and book a 30-minute review with our research team.",
    "Make Softer": "When you're ready, take a closer look at your AI-search footprint—small adjustments today compound into real visibility tomorrow.",
  },
};

// ---------- Icons ----------
const Icon = ({ name, size = 16, color = "currentColor", strokeWidth = 1.75 }) => {
  const s = { width:size, height:size, fill:"none", stroke:color, strokeWidth, strokeLinecap:"round", strokeLinejoin:"round" };
  switch (name) {
    case "spark": return <svg viewBox="0 0 24 24" {...s}><path d="M12 3v6M12 15v6M3 12h6M15 12h6M5.6 5.6l4.2 4.2M14.2 14.2l4.2 4.2M5.6 18.4l4.2-4.2M14.2 9.8l4.2-4.2"/></svg>;
    case "settings": return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>;
    case "bookmark": return <svg viewBox="0 0 24 24" {...s}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>;
    case "export": return <svg viewBox="0 0 24 24" {...s}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5-5 5 5M12 5v12"/></svg>;
    case "doc": return <svg viewBox="0 0 24 24" {...s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8M8 9h2"/></svg>;
    case "users": return <svg viewBox="0 0 24 24" {...s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case "tone": return <svg viewBox="0 0 24 24" {...s}><path d="M3 12h3l3-9 4 18 3-9h5"/></svg>;
    case "clock": return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case "globe": return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>;
    case "news": return <svg viewBox="0 0 24 24" {...s}><path d="M4 4h13v16H4z"/><path d="M17 8h3v10a2 2 0 0 1-2 2h-1M7 8h6M7 12h6M7 16h6"/></svg>;
    case "pdf": return <svg viewBox="0 0 24 24" {...s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13v5M9 13h2a1.5 1.5 0 0 1 0 3H9"/></svg>;
    case "blog": return <svg viewBox="0 0 24 24" {...s}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M9 7h7M9 11h5"/></svg>;
    case "linkedin": return <svg viewBox="0 0 24 24" {...s}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 13v4"/></svg>;
    case "twitter": return <svg viewBox="0 0 24 24" {...s}><path d="M4 4l7.5 9.5M20 4l-7.5 9.5M4 20l7-7M20 20l-7-7"/></svg>;
    case "mic": return <svg viewBox="0 0 24 24" {...s}><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>;
    case "play": return <svg viewBox="0 0 24 24" {...s}><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9l5 3-5 3z" fill={color} stroke="none"/></svg>;
    case "lock": return <svg viewBox="0 0 24 24" {...s}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>;
    case "check": return <svg viewBox="0 0 24 24" {...s}><path d="M5 12l5 5L20 7"/></svg>;
    case "checkc": return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="9" fill={color} stroke="none"/><path d="M8 12l3 3 5-6" stroke="#fff"/></svg>;
    case "warn": return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="9" fill="#FFB85C" stroke="none"/><path d="M12 8v4M12 16v.01" stroke="#fff"/></svg>;
    case "target": return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill={color} stroke="none"/></svg>;
    case "bars": return <svg viewBox="0 0 24 24" {...s}><path d="M5 20V11M12 20V4M19 20v-6"/></svg>;
    case "bulb": return <svg viewBox="0 0 24 24" {...s}><path d="M9 18h6M10 22h4M12 2a6 6 0 0 0-4 10c1 1 1.5 2 1.5 3v1h5v-1c0-1 .5-2 1.5-3a6 6 0 0 0-4-10z"/></svg>;
    case "external": return <svg viewBox="0 0 24 24" {...s}><path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></svg>;
    case "shield": return <svg viewBox="0 0 24 24" {...s}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/></svg>;
    case "link": return <svg viewBox="0 0 24 24" {...s}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.5 1.5"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5"/></svg>;
    case "user": return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>;
    case "chat": return <svg viewBox="0 0 24 24" {...s}><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
    case "book": return <svg viewBox="0 0 24 24" {...s}><path d="M4 4h7a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H4z"/><path d="M20 4h-7a3 3 0 0 0-3 3v14a2 2 0 0 1 2-2h8z"/></svg>;
    case "trend": return <svg viewBox="0 0 24 24" {...s}><path d="M3 17l6-6 4 4 8-8M14 7h7v7"/></svg>;
    case "people": return <svg viewBox="0 0 24 24" {...s}><circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="8" r="3"/><path d="M15 20a6 6 0 0 1 6-6"/></svg>;
    case "copy": return <svg viewBox="0 0 24 24" {...s}><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>;
    case "md": return <svg viewBox="0 0 24 24" {...s}><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 14V10l2 2 2-2v4M15 10v4M15 14l-2-2M15 14l2-2"/></svg>;
    case "code": return <svg viewBox="0 0 24 24" {...s}><path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/></svg>;
    case "pdfFile": return <svg viewBox="0 0 24 24" {...s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 14h8M8 18h5" /></svg>;
    case "substack": return <svg viewBox="0 0 24 24" {...s}><path d="M5 5h14M5 10h14M5 15h14v6l-7-3-7 3z"/></svg>;
    case "beehiiv": return <svg viewBox="0 0 24 24" {...s}><path d="M5 4h14l-2 6 2 6H5l2-6z"/></svg>;
    case "ghost": return <svg viewBox="0 0 24 24" {...s}><path d="M5 4h14v8M5 4v16M5 12h14M5 16h14M5 20h14"/></svg>;
    default: return null;
  }
};

// ---------- Generic UI ----------
const Dropdown = ({ icon, label, value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="dd-wrap">
      <div className="dd-label">{label}</div>
      <div className="dd" ref={ref}>
        <button className={`dd-trigger ${open ? "open" : ""}`} onClick={() => setOpen(!open)}>
          <span className="dd-trigger-left">
            <span className="dd-icon"><Icon name={icon} size={15} color="#6f6761" /></span>
            <span className="dd-value">{value}</span>
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6f6761" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{transform: open ? "rotate(180deg)" : "none", transition:"transform .15s"}}><path d="M6 9l6 6 6-6"/></svg>
        </button>
        {open && (
          <div className="dd-menu">
            {options.map(o => (
              <button key={o} className={`dd-item ${o===value?"sel":""}`} onClick={() => { onChange(o); setOpen(false); }}>
                <span>{o}</span>
                {o===value && <Icon name="check" size={14} color="#f04b13" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Toast = ({ msg }) => msg ? <div className="toast">{msg}</div> : null;

// ---------- App ----------
function Studio() {
  const [activeTab, setActiveTab] = useState("Workspace");
  const [topic, setTopic] = useState("How enterprise brands can improve AI search visibility in 2026, and what marketing leaders should know about generative discovery, citations, and answer-engine measurement.");
  const [type, setType] = useState("Insight / Analysis");
  const [audience, setAudience] = useState("Enterprise Leaders");
  const [tone, setTone] = useState("Boardroom-ready, analytical");
  const [length, setLength] = useState("Medium · 800–1,000 words");
  const [activeSrc, setActiveSrc] = useState({ web:true, news:true, pdfs:true, blogs:true });
  const [companies, setCompanies] = useState(["Microsoft", "OpenAI", "Salesforce"]);
  const [keywords, setKeywords] = useState(["acquisitions", "expansions", "AI partnerships"]);
  const [briefHighlight, setBriefHighlight] = useState(false);
  const [draftHighlight, setDraftHighlight] = useState(false);
  const [briefLoading, setBriefLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [draft, setDraft] = useState(DRAFT_DEFAULTS);
  const [activeSection, setActiveSection] = useState("hook");
  const [subjectIdx, setSubjectIdx] = useState(0);
  const [title, setTitle] = useState("AI Search Visibility: The Enterprise Playbook");
  const [subtitle, setSubtitle] = useState("How brands win the next discovery layer");
  const [score, setScore] = useState(84);
  const [savedAt, setSavedAt] = useState("2m ago");
  const [savedFlash, setSavedFlash] = useState(false);
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState(null);

  const sourceCount = useMemo(() => Object.values(activeSrc).filter(Boolean).length + 2, [activeSrc]);

  const flash = (m) => { setToast(m); setTimeout(()=>setToast(""), 1800); };

  const toggleSrc = (id) => setActiveSrc(s => ({ ...s, [id]: !s[id] }));
  const handleLockedSrc = (label) => flash(`${label} integration coming soon`);

  const generateBrief = () => {
    setBriefLoading(true);
    setTimeout(() => {
      setBriefLoading(false);
      setBriefHighlight(true);
      flash("Research brief refreshed");
      setTimeout(() => setBriefHighlight(false), 1600);
    }, 900);
  };
  const generateDraft = () => {
    setDraftLoading(true);
    setTimeout(() => {
      setDraftLoading(false);
      setDraftHighlight(true);
      flash("Newsletter draft generated");
      setTimeout(() => setDraftHighlight(false), 1600);
    }, 900);
  };

  const applyAction = (section, action) => {
    const txt = REWRITES[section]?.[action];
    if (!txt) return flash(`Applied: ${action}`);
    setDraft(d => ({ ...d, [section]: txt }));
    setActiveSection(section);
    setScore(s => Math.min(98, s + 1));
    setSavedAt("just now");
    flash(`${action} applied`);
  };

  const saveDraft = () => {
    setSavedFlash(true);
    setSavedAt("just now");
    setTimeout(() => setSavedFlash(false), 1400);
    flash("Draft saved");
  };

  const handleExport = (label) => {
    if (label === "Copy") {
      const text = `${title}\n${subtitle}\n\n${draft.hook}\n\n${draft.body}\n\n${draft.takeaways}\n\n${draft.cta}`;
      try { navigator.clipboard.writeText(text); } catch(e){}
      flash("Newsletter copied to clipboard");
    } else {
      flash(`${label} export prepared`);
    }
  };

  const subPreview = PREVIEW_BY_SUBJECT[subjectIdx] || PREVIEW_BY_SUBJECT[0];

  return (
    <div className="app">
      {/* Top nav */}
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"><Icon name="spark" size={20} color="#f04b13" /></div>
          <div className="brand-name">AI Research &amp; Newsletter Studio</div>
        </div>
        <nav className="topnav">
          {["Workspace","Templates","History"].map(t => (
            <button key={t} className={`topnav-item ${activeTab===t?"active":""}`} onClick={() => {
              setActiveTab(t);
              if (t === "Templates" || t === "History") setModal(t);
            }}>
              {t}
              {activeTab===t && <span className="topnav-bar"></span>}
            </button>
          ))}
        </nav>
        <div className="topactions">
          <button className="btn ghost" onClick={() => setModal("Settings")}>
            <Icon name="settings" size={15} /> Settings
          </button>
          <button className={`btn ghost ${savedFlash?"flash":""}`} onClick={saveDraft}>
            <Icon name="bookmark" size={15} /> {savedFlash ? "Saved" : "Save Draft"}
          </button>
          <button className="btn primary" onClick={() => handleExport("PDF")}>
            <Icon name="export" size={15} color="#fff" /> Export
          </button>
        </div>
      </header>

      {/* 3 columns */}
      <div className="grid">
        {/* LEFT */}
        <section className="card pad-card">
          <div className="card-header-row">
            <div className="card-title">Issue setup</div>
            <div className="step-pill">Step 1</div>
          </div>

          <div className="topic-card">
            <div className="topic-label">What should this issue be about?</div>
            <textarea className="topic-input" value={topic} onChange={e=>setTopic(e.target.value)} rows={6}/>
          </div>

          <div className="dd-stack">
            <Dropdown icon="doc" label="Newsletter Type" value={type} options={NEWSLETTER_TYPES} onChange={setType} />
            <Dropdown icon="users" label="Audience" value={audience} options={AUDIENCES} onChange={setAudience} />
            <Dropdown icon="tone" label="Tone" value={tone} options={TONES} onChange={setTone} />
            <Dropdown icon="clock" label="Length" value={length} options={LENGTHS} onChange={setLength} />
          </div>

          <TagInputSection
            label="Company news"
            kind="company"
            placeholder="Add a company…"
            value={companies}
            onChange={setCompanies}
            suggestions={["Anthropic", "Google DeepMind", "NVIDIA", "Stripe", "Databricks"]}
            hint="Track these companies in your research"
          />

          <TagInputSection
            label="Keywords"
            kind="keyword"
            placeholder="Add a keyword…"
            value={keywords}
            onChange={setKeywords}
            suggestions={["acquisitions", "expansions", "new technology", "collaborations", "funding rounds", "product launches"]}
            hint="Topics to prioritize when sourcing"
          />

          <div className="src-section">
            <div className="src-label">Research sources</div>
            <div className="src-grid">
              {ACTIVE_SOURCES.map(s => (
                <button key={s.id}
                  className={`src-chip ${activeSrc[s.id] ? "on" : ""}`}
                  onClick={() => toggleSrc(s.id)}>
                  <span className="src-chip-left">
                    <Icon name={s.icon} size={15} color={activeSrc[s.id] ? "#171717" : "#9a918a"} />
                    <span>{s.label}</span>
                  </span>
                  {activeSrc[s.id] ? <Icon name="checkc" size={16} color="#f04b13" /> : null}
                </button>
              ))}
              {LOCKED_SOURCES.map(s => (
                <button key={s.id} className="src-chip locked" onClick={() => handleLockedSrc(s.label)}>
                  <span className="src-chip-left">
                    <Icon name={s.icon} size={15} color="#9a918a" />
                    <span>{s.label}</span>
                  </span>
                  <Icon name="lock" size={14} color="#9a918a" />
                </button>
              ))}
            </div>
          </div>

          <button className={`btn primary big ${briefLoading?"loading":""}`} onClick={generateBrief}>
            {briefLoading ? <span className="spinner"/> : <Icon name="spark" size={16} color="#fff" />}
            {briefLoading ? "Generating brief…" : "Generate Research Brief"}
          </button>
        </section>

        {/* CENTER */}
        <section className="center-col">
          {/* Research brief */}
          <div className={`card pad-card ${briefHighlight?"hl":""}`}>
            <div className="section-head">
              <div className="head-left">
                <div className="step-num">2</div>
                <div>
                  <div className="card-title">Research Brief</div>
                  <div className="card-sub">Sourced findings, thesis, and editorial angle before drafting.</div>
                </div>
              </div>
              <div className="src-count">Sources <span className="src-count-num">{sourceCount}</span></div>
            </div>

            <div className="brief-rows">
              <div className="brief-row">
                <div className="brief-row-label"><Icon name="target" size={16} color="#171717"/>Main Thesis</div>
                <div className="brief-row-text">AI search visibility is becoming a measurable growth channel. Enterprises that structure trusted, entity-rich content will earn disproportionate inclusion across answer engines.</div>
              </div>
              <div className="brief-row">
                <div className="brief-row-label"><Icon name="bars" size={16} color="#171717"/>Key Findings</div>
                <ul className="brief-bullets">
                  <li>AI summaries and copilots are now discovery surfaces for executive buyers.</li>
                  <li>Authority signals, citations, and topical depth matter more than keyword density.</li>
                  <li>Teams need share-of-answer, source quality, and narrative consistency metrics.</li>
                </ul>
              </div>
              <div className="brief-row">
                <div className="brief-row-label"><Icon name="bulb" size={16} color="#171717"/>Suggested Angle</div>
                <div className="brief-row-text">Frame the issue as an operating playbook: how marketing, content, and analytics teams can make brand visibility measurable in AI-driven discovery.</div>
              </div>
            </div>

            <div className="src-cards">
              {SOURCE_CARDS.map(s => (
                <a key={s.id} className="src-card" href="#" onClick={(e)=>{e.preventDefault(); flash(`Opening ${s.domain}`)}}>
                  <div className="src-card-logo" style={{background: s.color}}>{s.letter}</div>
                  <div className="src-card-text">
                    <div className="src-card-title">{s.title}</div>
                    <div className="src-card-domain">{s.domain} <Icon name="external" size={11} color="#9a918a"/></div>
                  </div>
                </a>
              ))}
            </div>

            <div className="brief-cta-row">
              <button className={`btn primary ${draftLoading?"loading":""}`} onClick={generateDraft}>
                {draftLoading ? <span className="spinner"/> : <Icon name="spark" size={15} color="#fff" />}
                {draftLoading ? "Generating draft…" : "Generate Newsletter Draft"}
              </button>
            </div>
          </div>

          {/* Draft */}
          <div className={`card pad-card ${draftHighlight?"hl":""}`}>
            <div className="section-head">
              <div className="head-left">
                <div className="step-num">3</div>
                <div className="card-title">Newsletter Draft</div>
              </div>
              <div className="autosave"><Icon name="checkc" size={14} color="#137a3a"/>Auto-saved {savedAt}</div>
            </div>

            <div className="title-grid">
              <div>
                <div className="field-label">Title headline</div>
                <input className="field-input" value={title} onChange={e=>setTitle(e.target.value)}/>
              </div>
              <div>
                <div className="field-label">Subtitle / deck</div>
                <input className="field-input" value={subtitle} onChange={e=>setSubtitle(e.target.value)}/>
              </div>
            </div>

            <div className="block-list">
              <DraftBlock
                icon="chat" name="Opening Hook" sectionId="hook"
                text={draft.hook} active={activeSection==="hook"}
                onClickSection={() => setActiveSection("hook")}
                actions={["Rewrite Intro","Add Data","Make Sharper","Make More Executive"]}
                onAction={(a)=>applyAction("hook",a)}
              />
              <DraftBlock
                icon="doc" name="Main Body" sectionId="body"
                text={draft.body} active={activeSection==="body"}
                onClickSection={() => setActiveSection("body")}
                actions={["Make Sharper","Expand","Add Examples","Add Source","Simplify"]}
                onAction={(a)=>applyAction("body",a)}
              />
              <DraftBlock
                icon="bulb" name="Key Takeaways" sectionId="takeaways"
                text={draft.takeaways} active={activeSection==="takeaways"}
                onClickSection={() => setActiveSection("takeaways")}
                actions={["Shorten","Add Examples","Make Tactical","Make Executive"]}
                onAction={(a)=>applyAction("takeaways",a)}
              />
              <DraftBlock
                icon="trend" name="Closing CTA" sectionId="cta"
                text={draft.cta} active={activeSection==="cta"}
                onClickSection={() => setActiveSection("cta")}
                actions={["Make Bolder","Shorten","Add CTA","Make Softer"]}
                onAction={(a)=>applyAction("cta",a)}
              />
            </div>

            <div className="subj-grid">
              <div className="subj-card">
                <div className="field-label">Subject line options</div>
                <div className="subj-list">
                  {SUBJECT_OPTIONS.slice(0,3).map((s, i) => (
                    <button key={i} className={`subj-row ${subjectIdx===i?"sel":""}`} onClick={()=>setSubjectIdx(i)}>
                      <span className={`radio ${subjectIdx===i?"sel":""}`}>{subjectIdx===i && <span className="radio-dot"/>}</span>
                      <span className="subj-text">{s}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="subj-card">
                <div className="field-label">Preview text</div>
                <div className="preview-text">{subPreview}</div>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT */}
        <section className="right-col">
          {/* Score */}
          <div className="card pad-card">
            <div className="card-title">Issue Score</div>
            <div className="score-row">
              <ScoreRing value={score}/>
              <div className="score-summary">
                <div className="score-status">Ready with refinements</div>
                <div className="score-note">Strong thesis and structure. Add one proprietary example to improve originality.</div>
              </div>
            </div>
            <div className="score-list">
              <ScoreBar icon="shield" label="Originality" value={18} status="ok"/>
              <ScoreBar icon="link" label="Source Strength" value={18} status="ok"/>
              <ScoreBar icon="user" label="Executive Relevance" value={17} status="ok"/>
              <ScoreBar icon="chat" label="Clarity" value={15} status="ok"/>
              <ScoreBar icon="book" label="Readability" value={16} status="warn"/>
            </div>
          </div>

          {/* Recent issues */}
          <div className="card pad-card">
            <div className="card-header-row">
              <div className="card-title">Recent issues</div>
              <button className="link" onClick={()=>flash("Loading history…")}>View all</button>
            </div>
            <div className="recent-list">
              {RECENT_ISSUES.map((it, i) => (
                <button key={i} className="recent-item" onClick={()=>flash(`Opening "${it.title}"`)}>
                  <div className={`recent-thumb thumb-${it.icon}`}>
                    <Icon name={it.icon === "trend" ? "trend" : it.icon === "doc" ? "doc" : "people"} size={18} color="#171717"/>
                  </div>
                  <div className="recent-text">
                    <div className="recent-title">{it.title}</div>
                    <div className="recent-meta">{it.date}  ·  {it.words}</div>
                  </div>
                  <span className={`status status-${it.status.toLowerCase()}`}>{it.status}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Export */}
          <div className="card pad-card">
            <div className="card-title">Export &amp; Publish</div>
            <div className="export-grid">
              <ExportTile icon="copy" label="Copy" onClick={()=>handleExport("Copy")}/>
              <ExportTile icon="md" label="Markdown" onClick={()=>handleExport("Markdown")}/>
              <ExportTile icon="code" label="HTML" onClick={()=>handleExport("HTML")}/>
              <ExportTile icon="pdfFile" label="PDF" onClick={()=>handleExport("PDF")} accent/>
            </div>
            <div className="coming-soon-label">Coming soon</div>
            <div className="export-grid">
              <ExportTile icon="substack" label="Substack" locked/>
              <ExportTile icon="beehiiv" label="Beehiiv" locked/>
              <ExportTile icon="ghost" label="Ghost" locked/>
            </div>
          </div>
        </section>
      </div>

      <Toast msg={toast}/>
      {modal && <Modal title={modal} onClose={()=>{setModal(null); if(modal!=="Settings") setActiveTab("Workspace");}}/>}
    </div>
  );
}

// ---------- Sub components ----------
const TagInputSection = ({ label, kind, placeholder, value, onChange, suggestions, hint }) => {
  const [draft, setDraft] = useState("");
  const [focus, setFocus] = useState(false);
  const add = (v) => {
    const t = v.trim();
    if (!t) return;
    if (value.some(x => x.toLowerCase() === t.toLowerCase())) return;
    onChange([...value, t]);
    setDraft("");
  };
  const remove = (i) => onChange(value.filter((_,idx)=>idx!==i));
  const onKey = (e) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(draft); }
    else if (e.key === "Backspace" && !draft && value.length) { remove(value.length-1); }
  };
  const remaining = suggestions.filter(s => !value.some(v => v.toLowerCase()===s.toLowerCase()));
  return (
    <div className="tag-section">
      <div className="tag-section-head">
        <div className="tag-label-wrap">
          <Icon name={kind === "company" ? "users" : "target"} size={14} color="#171717"/>
          <div className="tag-label">{label}</div>
        </div>
        <div className="tag-count">{value.length}</div>
      </div>
      <div className={`tag-box ${focus?"focus":""}`} onClick={(e)=>{ e.currentTarget.querySelector("input")?.focus(); }}>
        {value.map((t, i) => (
          <span key={i} className={`tag ${kind}`}>
            {t}
            <button className="tag-x" onClick={(e)=>{e.stopPropagation(); remove(i);}}>×</button>
          </span>
        ))}
        <input
          className="tag-input"
          value={draft}
          placeholder={value.length ? "" : placeholder}
          onChange={e=>setDraft(e.target.value)}
          onKeyDown={onKey}
          onFocus={()=>setFocus(true)}
          onBlur={()=>{ setFocus(false); if (draft) add(draft); }}
        />
      </div>
      {remaining.length > 0 && (
        <div className="tag-suggest">
          {remaining.slice(0,4).map(s => (
            <button key={s} className="tag-suggest-chip" onClick={()=>add(s)}>+ {s}</button>
          ))}
        </div>
      )}
      {hint && <div className="tag-hint">{hint}</div>}
    </div>
  );
};

const DraftBlock = ({ icon, name, text, actions, onAction, active, onClickSection }) => (
  <div className={`block ${active?"active":""}`} onClick={onClickSection}>
    <div className="block-label"><Icon name={icon} size={15} color="#f04b13"/>{name}</div>
    <div className="block-text">{text}</div>
    <div className="block-actions">
      {actions.map(a => (
        <button key={a} className="chip" onClick={(e)=>{e.stopPropagation(); onAction(a);}}>{a}</button>
      ))}
    </div>
  </div>
);

const ScoreRing = ({ value }) => {
  const r = 46, c = 2 * Math.PI * r;
  const off = c - (value/100)*c;
  return (
    <div className="ring-wrap">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} stroke="#f1e7df" strokeWidth="9" fill="none"/>
        <circle cx="60" cy="60" r={r} stroke="#f04b13" strokeWidth="9" fill="none"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          transform="rotate(-90 60 60)"/>
      </svg>
      <div className="ring-text">
        <div className="ring-num">{value}</div>
        <div className="ring-denom">/100</div>
      </div>
    </div>
  );
};

const ScoreBar = ({ icon, label, value, status }) => {
  const pct = (value/20)*100;
  const colorMap = { ok:"#137a3a", warn:"#f04b13" };
  return (
    <div className="score-bar-row">
      <div className="score-bar-label">
        <Icon name={icon} size={14} color="#6f6761"/>
        <span>{label}</span>
      </div>
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${pct}%`, background: colorMap[status]}}/>
      </div>
      <div className="score-bar-num">{value}/20</div>
      {status === "ok"
        ? <Icon name="checkc" size={16} color="#137a3a"/>
        : <Icon name="warn" size={16} color="#f04b13"/>}
    </div>
  );
};

const ExportTile = ({ icon, label, onClick, locked, accent }) => (
  <button className={`exp-tile ${locked?"locked":""} ${accent?"accent":""}`} onClick={onClick} disabled={locked}>
    <div className="exp-icon"><Icon name={icon} size={20} color={locked ? "#9a918a" : "#171717"}/></div>
    <div className="exp-label">{label}</div>
    {locked && <div className="exp-lock"><Icon name="lock" size={12} color="#9a918a"/></div>}
  </button>
);

const Modal = ({ title, onClose }) => (
  <div className="modal-bg" onClick={onClose}>
    <div className="modal" onClick={e=>e.stopPropagation()}>
      <div className="modal-head">
        <div className="card-title">{title}</div>
        <button className="modal-close" onClick={onClose}>×</button>
      </div>
      <div className="modal-body">
        {title === "Settings" && (
          <div className="settings-list">
            <SettingRow label="Brand voice profile" hint="Default voice"/>
            <SettingRow label="Workspace name" hint="Studio Workspace"/>
            <SettingRow label="Default newsletter type" hint="Insight / Analysis"/>
            <SettingRow label="Default audience" hint="Enterprise Leaders"/>
            <SettingRow label="Source credibility threshold" hint="Standard"/>
          </div>
        )}
        {title === "Templates" && (
          <div className="settings-list">
            <SettingRow label="Executive Brief — Weekly" hint="Use template"/>
            <SettingRow label="Market Trend Deep Dive" hint="Use template"/>
            <SettingRow label="Founder Note · Personal" hint="Use template"/>
            <SettingRow label="Competitive Intelligence Roundup" hint="Use template"/>
          </div>
        )}
        {title === "History" && (
          <div className="settings-list">
            {RECENT_ISSUES.map((r,i)=>(
              <SettingRow key={i} label={r.title} hint={`${r.date} · ${r.status}`}/>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

const SettingRow = ({ label, hint }) => (
  <div className="setting-row">
    <div className="setting-label">{label}</div>
    <div className="setting-hint">{hint}</div>
  </div>
);

ReactDOM.createRoot(document.getElementById("root")).render(<Studio/>);
