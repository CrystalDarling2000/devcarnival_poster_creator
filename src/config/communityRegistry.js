const svgData = (svg) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

function makeTemplate(community, category, colors, title, subtitle) {
  const { width, height } = { width: 1080, height: 1350 };
  const logoMark = community.slice(0, 2).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="wash" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${colors[0]}"/><stop offset="1" stop-color="${colors[1]}"/></linearGradient>
      <pattern id="grid" width="56" height="56" patternUnits="userSpaceOnUse"><path d="M56 0H0V56" fill="none" stroke="#fff" stroke-opacity=".14" stroke-width="2"/></pattern>
    </defs>
    <rect width="1080" height="1350" fill="#f8fafc"/>
    <path d="M0 0h1080v605c-220 76-404-75-603 12C300 699 162 695 0 640z" fill="url(#wash)"/>
    <path d="M0 0h1080v605c-220 76-404-75-603 12C300 699 162 695 0 640z" fill="url(#grid)"/>
    <circle cx="1010" cy="104" r="195" fill="#fff" opacity=".08"/><circle cx="78" cy="550" r="150" fill="#fff" opacity=".08"/>
    <rect x="76" y="74" width="100" height="100" rx="28" fill="#fff" opacity=".95"/>
    <text x="126" y="139" text-anchor="middle" font-family="Arial,sans-serif" font-size="35" font-weight="800" fill="${colors[0]}">${logoMark}</text>
    <text x="208" y="116" font-family="Arial,sans-serif" font-size="27" font-weight="700" fill="#fff">${community}</text>
    <text x="208" y="155" font-family="Arial,sans-serif" font-size="16" letter-spacing="3" fill="#fff" opacity=".78">COMMUNITY HUB • OFFICIAL TEMPLATE</text>
    <text x="76" y="355" font-family="Arial,sans-serif" font-size="24" font-weight="700" letter-spacing="4" fill="#fff" opacity=".85">${category.toUpperCase()}</text>
    <text x="76" y="442" font-family="Arial,sans-serif" font-size="68" font-weight="800" fill="#fff">${title}</text>
    <text x="80" y="495" font-family="Arial,sans-serif" font-size="25" fill="#fff" opacity=".85">${subtitle}</text>
    <rect x="76" y="718" width="928" height="1" fill="#dbe2ed"/>
    <rect x="76" y="1242" width="928" height="2" rx="1" fill="${colors[0]}" opacity=".35"/>
    <text x="76" y="1290" font-family="Arial,sans-serif" font-size="19" font-weight="700" fill="#64748b">${community}  •  COMMUNITY HUB POSTER STUDIO</text>
    <text x="1004" y="1290" text-anchor="end" font-family="Arial,sans-serif" font-size="17" fill="#94a3b8">COMMUNITY • CONNECT • CREATE</text>
  </svg>`;
  return {
    id: `${category}-${community.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    category,
    image: svgData(svg),
    originalWidth: width,
    originalHeight: height,
    editableFields: {},
  };
}

function createCommunity(id, name, description, colors, topics) {
  const templates = {
    collaboration: makeTemplate(name, "collaboration", colors, "Better together.", "A collaboration built by communities"),
    attendee: makeTemplate(name, "attendee", colors, "Meet the community.", "Celebrating the people who make it happen"),
    leads: makeTemplate(name, "leads", colors, "Meet our team.", "The people building this community"),
  };
  templates.collaboration.editableFields = {
    communityName: { enabled: true, x: 0.53, y: 0.62, maxWidth: 0.37, maxHeight: 0.08 },
    communityLogo: { enabled: true, x: 0.1, y: 0.58, width: 0.22, height: 0.17 },
  };
  templates.attendee.editableFields = {
    attendeePhoto: { enabled: true, x: 0.35, y: 0.39, width: 0.3, height: 0.3 },
    attendeeName: { enabled: false, x: 0.18, y: 0.74, maxWidth: 0.64, maxHeight: 0.07 },
  };
  templates.leads.editableFields = {
    leadPhoto: { enabled: true, x: 0.1, y: 0.56, width: 0.3, height: 0.29 },
    communityName: { enabled: true, x: 0.47, y: 0.59, maxWidth: 0.43, maxHeight: 0.09 },
    communityDescription: { enabled: true, x: 0.47, y: 0.68, maxWidth: 0.43, maxHeight: 0.15 },
  };
  return {
    id,
    name,
    description,
    logo: "",
    website: "",
    linkedin: "",
    instagram: "",
    brandColors: colors,
    topics,
    templates,
  };
}

export const initialCommunities = [
  createCommunity(
    "community-001",
    "AI Geeks Chennai",
    "A welcoming community exploring artificial intelligence, machine learning, and emerging technology.",
    ["#6847d9", "#a05be8"],
    ["Artificial intelligence", "Machine learning", "Community events"],
  ),
  createCommunity(
    "community-002",
    "Tamil Nadu Java User Group",
    "A developer-led space for sharing Java knowledge, building connections, and growing together.",
    ["#df6a30", "#e7a331"],
    ["Java", "Developer community", "Meetups"],
  ),
];

export const categoryLabels = {
  collaboration: "Community Collaboration",
  attendee: "Attendee Introduction",
  leads: "Leads & Working Committee",
};
