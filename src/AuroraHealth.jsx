import { useState, useEffect, useCallback, useRef } from "react";
import { Brain, Heart, SmilePlus, Bone, Moon, BatteryLow, ChevronDown, Check, RefreshCw, Sun, AlertTriangle, Settings, CircleCheckBig, Sparkles, BookOpen, ExternalLink, Info, ShieldAlert, Activity, Gauge } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
   AURORA HEALTH v3.0
   Material Design 3 · Lighter typography · Health-conditions-first dashboard
   ═══════════════════════════════════════════════════════════════════════════ */

const HEALTH_RULES = [
  {
    condition: "Migraines", icon: "brain", slug: "migraines",
    thresholds: [
      { max: 2, level: "low", desc: "Solar conditions are calm. Migraine triggers from space weather are very unlikely today.", tip: "A good day for cognitively demanding tasks." },
      { max: 4, level: "moderate", desc: "Some solar activity may increase sensitivity for migraine-prone individuals.", tip: "Keep hydrated and limit screen time in the evening." },
      { max: 6, level: "high", desc: "Heightened solar activity is raising migraine risk for sensitive individuals.", tip: "Take preventative measures now — rest, magnesium, dim lighting." },
      { max: 9, level: "high", desc: "Intense solar storm in progress. Migraine risk is at its highest.", tip: "Strongly consider staying indoors. Avoid bright lights and loud noise." },
    ],
  },
  {
    condition: "Heart Health", icon: "heart", slug: "heart",
    thresholds: [
      { max: 2, level: "low", desc: "Calm solar conditions. Your cardiovascular system is unlikely to be affected.", tip: "Good day for moderate exercise." },
      { max: 4, level: "low", desc: "Minimal space weather impact on heart health expected today.", tip: "Maintain your usual routine safely." },
      { max: 6, level: "moderate", desc: "Increased solar activity may slightly raise blood pressure and stress hormones in some people.", tip: "Avoid intense exercise. Stay calm and hydrated." },
      { max: 9, level: "high", desc: "Strong solar storms have been linked to increased heart-related risks.", tip: "If you have a heart condition, contact your doctor. Rest and avoid exertion." },
    ],
  },
  {
    condition: "Mental Health", icon: "smile", slug: "mental",
    thresholds: [
      { max: 2, level: "low", desc: "Calm conditions support stable mood and healthy sleep patterns.", tip: "Great time for mindfulness or socialising." },
      { max: 4, level: "low", desc: "Minor space weather changes, unlikely to affect your mood.", tip: "Normal self-care routines are sufficient." },
      { max: 6, level: "moderate", desc: "Increased solar activity may affect sleep hormones and mood regulation.", tip: "Prioritise sleep hygiene tonight. Limit news and social media." },
      { max: 9, level: "high", desc: "Intense solar activity is linked to increased anxiety and disrupted sleep.", tip: "Be kind to yourself today. Grounding exercises and early sleep are recommended." },
    ],
  },
  {
    condition: "Joint Pain", icon: "bone", slug: "joints",
    thresholds: [
      { max: 2, level: "low", desc: "Stable atmospheric conditions. Joint comfort expected today.", tip: "A good day for gentle stretching or walks." },
      { max: 4, level: "low", desc: "Minimal pressure changes expected. Joints should feel comfortable.", tip: "Normal activity levels are fine." },
      { max: 6, level: "moderate", desc: "Solar activity can shift atmospheric pressure, which may increase joint discomfort.", tip: "Consider anti-inflammatory foods or warm compresses if you feel discomfort." },
      { max: 9, level: "high", desc: "Strong solar storms may noticeably worsen joint stiffness and inflammation.", tip: "Rest, apply heat, and consider pain relief medication if needed." },
    ],
  },
  {
    condition: "Sleep Quality", icon: "moon", slug: "sleep",
    thresholds: [
      { max: 2, level: "low", desc: "Excellent conditions for deep, restorative sleep tonight.", tip: "Take advantage — aim for 8 hours tonight." },
      { max: 4, level: "low", desc: "Good sleep conditions. Space weather is unlikely to disturb your rest.", tip: "Maintain your usual wind-down routine." },
      { max: 6, level: "moderate", desc: "Solar activity may interfere with your sleep hormone (melatonin), making it harder to fall asleep.", tip: "Avoid screens 2 hours before bed. Try blackout curtains and a cool room." },
      { max: 9, level: "high", desc: "Intense solar storms commonly cause difficulty sleeping and vivid dreams.", tip: "Go to bed early. Avoid caffeine after noon. Consider magnesium supplements." },
    ],
  },
  {
    condition: "Fatigue", icon: "battery", slug: "fatigue",
    thresholds: [
      { max: 2, level: "low", desc: "Calm solar conditions support your natural energy levels.", tip: "A productive, energetic day ahead." },
      { max: 4, level: "low", desc: "Space weather is unlikely to affect your energy today.", tip: "Energy levels should remain stable." },
      { max: 6, level: "moderate", desc: "Increased solar activity may cause unexplained tiredness in some people.", tip: "Pace yourself. Prioritise iron-rich foods and short rest breaks." },
      { max: 9, level: "high", desc: "Intense solar storms can cause significant fatigue — even for people who aren't usually sensitive.", tip: "Do not push through exhaustion today. Rest is the best medicine." },
    ],
  },
];

const ALL_CONDITIONS = HEALTH_RULES.map(r => r.condition);

function getRisk(name, kp, sensitivity = "Medium") {
  const rule = HEALTH_RULES.find(r => r.condition === name);
  if (!rule) return null;
  // Sensitivity shifts the effective Kp: High sensitivity treats the activity as stronger
  const offset = sensitivity === "High" ? 1.5 : sensitivity === "Low" ? -1 : 0;
  const effectiveKp = Math.max(0, Math.min(9, kp + offset));
  for (const t of rule.thresholds) {
    if (effectiveKp <= t.max) return { condition: name, icon: rule.icon, slug: rule.slug, level: t.level, desc: t.desc, tip: t.tip };
  }
  const last = rule.thresholds[3];
  return { condition: name, icon: rule.icon, slug: rule.slug, level: last.level, desc: last.desc, tip: last.tip };
}

function kpLabel(kp) {
  if (kp <= 1) return "Quiet";
  if (kp <= 3) return "Unsettled";
  if (kp <= 5) return "Minor storm";
  if (kp <= 7) return "Moderate storm";
  return "Severe storm";
}

function overallMsg(kp) {
  if (kp <= 1) return "The cosmos is calm — an ideal day for your wellbeing.";
  if (kp <= 3) return "Conditions are settled. Minor solar activity is unlikely to affect you.";
  if (kp <= 5) return "Moderate solar activity detected. Sensitive individuals may notice effects.";
  if (kp <= 7) return "A strong geomagnetic storm is in progress. Take extra care today.";
  return "Extreme solar storm active. High health impact expected across most conditions.";
}

function solarScale(kp) {
  // Maps Kp 0–9 to a human-friendly 5-point scale
  if (kp <= 1) return { position: 0.08, label: "Calm", color: T.green, summary: "Very low solar activity. A great day for everyone." };
  if (kp <= 3) return { position: 0.28, label: "Settled", color: T.green, summary: "Minor activity — unlikely to affect most people." };
  if (kp <= 5) return { position: 0.50, label: "Moderate", color: T.amber, summary: "Moderate activity. Those with sensitivities may notice effects." };
  if (kp <= 7) return { position: 0.72, label: "Active", color: T.rose, summary: "Strong geomagnetic storm. Take extra care of yourself today." };
  return { position: 0.92, label: "Intense", color: T.red, summary: "Extreme storm conditions. Most people may feel effects." };
}

const DID_YOU_KNOW = [
  "Geomagnetic storms can affect your body's biological rhythms. Research has found links between strong solar activity and increased rates of migraines, heart rhythm changes, and disrupted sleep.",
  "Your pineal gland — which produces the sleep hormone melatonin — is sensitive to changes in Earth's magnetic field. That's one reason solar storms can disrupt your sleep.",
  "A 2024 study from Brazil found that hospital admissions for heart-related events rose significantly during periods of high solar activity — especially among women over 30.",
  "The sun goes through an 11-year activity cycle. During the peak (solar maximum), storms are more frequent and intense. We're currently near a solar maximum.",
  "Some researchers believe humans have a built-in magnetic sense — similar to migratory birds — which may explain why certain people are more sensitive to space weather than others.",
  "Geomagnetic storms don't just affect health. They can disrupt GPS signals, radio communications, and even power grids. The famous 1989 Quebec blackout was caused by a solar storm.",
  "Studies show that melatonin levels can drop measurably during strong geomagnetic disturbances, particularly at higher latitudes — which may explain increased insomnia during solar storms.",
  "Not everyone is equally affected by space weather. People with pre-existing conditions, disrupted sleep patterns, or high stress levels tend to notice effects more.",
];

const MOCK = { kpIndex: 4, aIndex: 18, dstIndex: -22, stormStatus: "Unsettled", summary: "Geomagnetic conditions are unsettled following a minor CME impact. A further disturbance is possible in the next 24 hours." };

const LOGO_URI = "/Auroralogo.png";

async function fetchSolar(key) {
  try {
    if (!key) throw new Error("No API key");
    const query = `?api_key=${encodeURIComponent(key)}`;
    const [kRes, aRes] = await Promise.all([
      fetch(`/api/sws/get-k-index${query}`),
      fetch(`/api/sws/get-a-index${query}`),
    ]);
    if (!kRes.ok || !aRes.ok) throw new Error("API error");
    const kData = await kRes.json();
    const aData = await aRes.json();
    // SWS returns { data: [{ index: N, valid_time: "..." }, ...] } — latest first
    const kArr = kData.data || kData;
    const aArr = aData.data || aData;
    const kp = Number(Array.isArray(kArr) ? kArr[0]?.index : kArr?.index) || 0;
    const a = Number(Array.isArray(aArr) ? aArr[0]?.index : aArr?.index) || 0;
    return { kpIndex: kp, aIndex: a, dstIndex: 0, stormStatus: kpLabel(kp), summary: `Live data — last updated ${kArr[0]?.valid_time?.slice(0, 16) || "recently"}`, live: true };
  } catch { return { ...MOCK, live: false }; }
}

// ── THEME ──────────────────────────────────────────────────────────────────
const T = {
  bg: "#060b16",
  surface1: "rgba(255,255,255,0.035)",
  surface2: "rgba(255,255,255,0.055)",
  surface3: "rgba(255,255,255,0.08)",
  border: "rgba(255,255,255,0.07)",
  borderFocus: "rgba(255,255,255,0.18)",
  text: "#dfe6f0",
  textSecondary: "#94a0b8",
  textTertiary: "#7a8ba3",
  green: "#45dba8",
  greenSoft: "rgba(69,219,168,0.10)",
  greenBorder: "rgba(69,219,168,0.22)",
  purple: "#a78bfa",
  purpleSoft: "rgba(167,139,250,0.10)",
  purpleBorder: "rgba(167,139,250,0.22)",
  rose: "#f472b6",
  roseSoft: "rgba(244,114,182,0.10)",
  roseBorder: "rgba(244,114,182,0.22)",
  amber: "#fbbf24",
  amberSoft: "rgba(251,191,36,0.08)",
  amberBorder: "rgba(251,191,36,0.20)",
  red: "#f06060",
  redSoft: "rgba(240,96,96,0.08)",
  redBorder: "rgba(240,96,96,0.20)",
  elevation1: "0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)",
  elevation2: "0 4px 12px rgba(0,0,0,0.35), 0 1px 4px rgba(0,0,0,0.2)",
  elevation3: "0 8px 24px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.25)",
  radius: 16,
  radiusSm: 12,
  radiusXs: 8,
};

const rk = {
  low:      { bg: T.greenSoft, border: T.greenBorder, text: T.green, dot: T.green },
  moderate: { bg: T.amberSoft, border: T.amberBorder, text: T.amber, dot: T.amber },
  high:     { bg: T.redSoft,   border: T.redBorder,   text: T.red,   dot: T.red },
};


// ── ICON & LABEL MAPS ─────────────────────────────────────────────────────
const CONDITION_ICONS = {
  brain: Brain, heart: Heart, smile: SmilePlus, bone: Bone, moon: Moon, battery: BatteryLow,
};

const RISK_LABELS = { low: "All clear", moderate: "Caution", high: "Alert" };

const font = "'DM Sans', 'SF Pro Text', system-ui, -apple-system, sans-serif";

// ── CSS ────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:focus-visible{outline:2px solid ${T.purple};outline-offset:2px;border-radius:4px}

.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}

.skip-link{position:absolute;top:-100%;left:16px;background:${T.green};color:#000;padding:8px 16px;border-radius:${T.radiusXs}px;font-weight:600;font-size:14px;z-index:100;text-decoration:none;font-family:${font}}
.skip-link:focus{top:8px}

@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
@keyframes gaugeIn{from{stroke-dasharray:0 157}}

.fade-up{animation:fadeUp 0.35s ease-out both}

.m-card{
  background:${T.surface1};border:1px solid ${T.border};border-radius:${T.radius}px;
  padding:16px 18px;box-shadow:${T.elevation1};transition:background 0.2s,border-color 0.2s,box-shadow 0.2s;
}
.m-card-interactive{cursor:pointer}
.m-card-interactive:hover{background:${T.surface2};border-color:${T.borderFocus};box-shadow:${T.elevation2}}

.btn-filled{
  width:100%;border:none;border-radius:${T.radius}px;padding:15px;font-size:15px;font-weight:600;font-family:${font};
  cursor:pointer;transition:filter 0.15s,transform 0.1s;letter-spacing:0.01em;
}
.btn-filled:hover{filter:brightness(1.1)}.btn-filled:active{transform:scale(0.985)}
.btn-filled:disabled{opacity:0.35;cursor:not-allowed;filter:none}.btn-filled:disabled:active{transform:none}

.btn-tonal{
  width:100%;background:${T.surface2};color:${T.textSecondary};border:1px solid ${T.border};border-radius:${T.radius}px;
  padding:14px;font-size:14px;font-weight:500;font-family:${font};cursor:pointer;transition:background 0.15s,border-color 0.15s,color 0.15s;
}
.btn-tonal:hover{background:${T.surface3};border-color:${T.borderFocus};color:${T.text}}

.m-input{
  width:100%;background:${T.surface1};border:1px solid ${T.border};border-radius:${T.radiusSm}px;
  padding:13px 16px;font-size:15px;color:${T.text};font-family:${font};font-weight:400;outline:none;
  transition:border-color 0.2s,box-shadow 0.2s;
}
.m-input::placeholder{color:${T.textTertiary}}
.m-input:focus{border-color:${T.purpleBorder};box-shadow:0 0 0 3px ${T.purpleSoft}}

.tab-bar{
  position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:480px;
  background:rgba(6,11,22,0.95);backdrop-filter:blur(20px);border-top:1px solid ${T.border};
  display:flex;padding:6px 0 env(safe-area-inset-bottom,14px);z-index:10;
}
.tab-btn{
  flex:1;background:none;border:none;cursor:pointer;display:flex;flex-direction:column;align-items:center;
  gap:2px;padding:8px 0;position:relative;font-family:${font};transition:opacity 0.15s;
}
.tab-btn svg{width:22px;height:22px;transition:color 0.2s}
.tab-btn span{font-size:11px;font-weight:500;transition:color 0.2s;letter-spacing:0.02em}
.tab-btn[aria-selected="true"] svg{color:${T.green}}
.tab-btn[aria-selected="false"] svg{color:${T.textTertiary}}
.tab-btn[aria-selected="true"] span{color:${T.green};font-weight:600}
.tab-btn[aria-selected="false"] span{color:${T.textTertiary}}

.badge-count{
  position:absolute;top:2px;right:calc(50% - 22px);background:${T.red};color:#fff;border-radius:10px;
  font-size:10px;font-weight:700;min-width:16px;height:16px;display:flex;align-items:center;justify-content:center;padding:0 4px;
}

.section-title{font-size:13px;font-weight:500;letter-spacing:0.04em;color:${T.textTertiary};margin-bottom:12px}

.ck-box{
  width:20px;height:20px;border-radius:6px;flex-shrink:0;border:1.5px solid rgba(255,255,255,0.18);
  display:flex;align-items:center;justify-content:center;transition:all 0.15s;
}
.ck-box[data-on="true"]{background:${T.green};border-color:${T.green}}
`;



// ── SMALL COMPONENTS ───────────────────────────────────────────────────────

function RiskBadge({ level }) {
  const c = rk[level];
  return (
    <span role="status" aria-label={`${RISK_LABELS[level]}`}
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600, letterSpacing: "0.03em", textTransform: "capitalize", whiteSpace: "nowrap" }}>
      {RISK_LABELS[level]}
    </span>
  );
}

function CondIcon({ icon, size = 20, color }) {
  const Comp = CONDITION_ICONS[icon];
  if (!Comp) return null;
  return <Comp size={size} color={color || T.textSecondary} strokeWidth={1.8} />;
}

function KpGauge({ value }) {
  const color = value <= 2 ? T.green : value <= 4 ? T.amber : value <= 6 ? T.rose : T.red;
  const dash = (value / 9) * 157;
  return (
    <div style={{ textAlign: "center" }} role="img" aria-label={`Kp index ${value} of 9, ${kpLabel(value)}`}>
      <div style={{ position: "relative", display: "inline-flex", alignItems: "flex-end", justifyContent: "center" }}>
        <svg width="100" height="56" viewBox="0 0 120 66" aria-hidden="true">
          <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" strokeLinecap="round"/>
          <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
            strokeDasharray={`${dash} 157`} style={{ transition: "stroke-dasharray 0.9s ease, stroke 0.3s", animation: "gaugeIn 1s ease-out" }}/>
        </svg>
        <div style={{ position: "absolute", bottom: 0, textAlign: "center", paddingBottom: 1 }} aria-hidden="true">
          <div style={{ fontSize: 26, fontWeight: 700, color: T.text, lineHeight: 1, letterSpacing: "-0.03em" }}>{value}</div>
          <div style={{ fontSize: 8, color: T.textTertiary, marginTop: 2, letterSpacing: "0.12em", fontWeight: 500, textTransform: "uppercase" }}>Kp</div>
        </div>
      </div>
      <div style={{ fontSize: 11, color, fontWeight: 600, marginTop: 4, letterSpacing: "0.02em" }} aria-hidden="true">{kpLabel(value)}</div>
    </div>
  );
}

function Pill({ label, value, color }) {
  return (
    <div style={{ background: T.surface1, border: `1px solid ${T.border}`, borderRadius: T.radiusSm, padding: "10px 12px", flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 9, color: T.textTertiary, letterSpacing: "0.08em", marginBottom: 3, fontWeight: 500, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: color || T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</div>
    </div>
  );
}

function SolarActivityBar({ kp }) {
  const scale = solarScale(kp);
  const stops = [
    { pos: 0, label: "Calm" },
    { pos: 0.5, label: "Moderate" },
    { pos: 1, label: "Intense" },
  ];

  return (
    <div role="img" aria-label={`Solar activity level: ${scale.label}. ${scale.summary}`}>
      {/* Label + current level */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: T.textTertiary }}>Solar activity</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: scale.color }}>{scale.label}</span>
      </div>

      {/* The bar */}
      <div style={{ position: "relative", marginBottom: 6 }}>
        <div style={{
          height: 8, borderRadius: 4, width: "100%",
          background: `linear-gradient(to right, ${T.green} 0%, ${T.green} 25%, ${T.amber} 50%, ${T.rose} 75%, ${T.red} 100%)`,
          opacity: 0.85,
        }}/>
        {/* Marker */}
        <div style={{
          position: "absolute", top: "50%", left: `${scale.position * 100}%`,
          transform: "translate(-50%, -50%)",
          width: 16, height: 16, borderRadius: "50%",
          background: scale.color,
          border: "2.5px solid #fff",
          boxShadow: `0 0 8px ${scale.color}66, ${T.elevation1}`,
          transition: "left 0.8s ease, background 0.4s",
        }}/>
      </div>

      {/* Scale labels */}
      <div style={{ display: "flex", justifyContent: "space-between" }} aria-hidden="true">
        {stops.map(s => (
          <span key={s.label} style={{ fontSize: 10, color: T.textTertiary, fontWeight: 400 }}>{s.label}</span>
        ))}
      </div>

      {/* Friendly summary */}
      <p style={{ fontSize: 13, color: T.textSecondary, margin: "12px 0 0", lineHeight: 1.55, fontWeight: 400 }}>
        {scale.summary}
      </p>
    </div>
  );
}

function AlertCard({ r, onDismiss }) {
  const c = rk[r.level];
  return (
    <article className="m-card fade-up" role="alert" aria-label={`${r.level} alert for ${r.condition}`}
      style={{ background: c.bg, borderColor: c.border, display: "flex", gap: 12, alignItems: "flex-start" }}>
      <AlertTriangle size={20} color={rk[r.level].text} strokeWidth={1.8} style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{r.condition}</span>
          <RiskBadge level={r.level}/>
        </div>
        <p style={{ fontSize: 13, color: T.textSecondary, margin: "0 0 8px", lineHeight: 1.55 }}>{r.desc}</p>
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: T.radiusXs, padding: "9px 12px" }}>
          <p style={{ fontSize: 13, color: c.text, margin: 0, fontWeight: 500, lineHeight: 1.5 }}>💡 {r.tip}</p>
        </div>
      </div>
      {onDismiss && (
        <button onClick={e => { e.stopPropagation(); onDismiss(); }} aria-label={`Dismiss ${r.condition} alert`}
          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", fontSize: 20, cursor: "pointer", padding: 4, lineHeight: 1, flexShrink: 0, borderRadius: 6 }}>×</button>
      )}
    </article>
  );
}

function HealthCard({ r, open, onToggle }) {
  const c = rk[r.level];
  const pid = `hp-${r.slug}`, hid = `hh-${r.slug}`;
  return (
    <div className="m-card m-card-interactive" style={{ borderColor: open ? c.border : undefined, boxShadow: open ? T.elevation2 : T.elevation1 }}>
      <button id={hid} onClick={onToggle} aria-expanded={open} aria-controls={pid}
        style={{ width: "100%", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", padding: 0, fontFamily: font }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <CondIcon icon={r.icon} size={20} color={rk[r.level].text} />
          <span style={{ fontSize: 14, fontWeight: 500, color: T.text }}>{r.condition}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <RiskBadge level={r.level}/>
          <span aria-hidden="true" style={{ color: "rgba(255,255,255,0.2)", width: 16, height: 16, display: "inline-flex", transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}>
            <ChevronDown size={16} strokeWidth={2} />
          </span>
        </div>
      </button>
      {open && (
        <div id={pid} role="region" aria-labelledby={hid} style={{ marginTop: 14, borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
          <p style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.6, margin: "0 0 12px" }}>{r.desc}</p>
          <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: T.radiusSm, padding: "11px 14px" }}>
            <div style={{ fontSize: 10, color: c.text, fontWeight: 600, letterSpacing: "0.08em", marginBottom: 5, textTransform: "uppercase" }}>Suggestion</div>
            <p style={{ fontSize: 13, color: T.text, margin: 0, lineHeight: 1.55, fontWeight: 400 }}>{r.tip}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Progress({ step, total }) {
  return (
    <div role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={total} aria-label={`Step ${step} of ${total}`}
      style={{ display: "flex", gap: 6, marginBottom: 28 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ height: 2.5, flex: 1, borderRadius: 2, background: i < step ? T.green : "rgba(255,255,255,0.07)", transition: "background 0.3s" }}/>
      ))}
    </div>
  );
}

function CondCheck({ condition, icon, selected, onChange }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", background: selected ? T.greenSoft : T.surface1, border: `1px solid ${selected ? T.greenBorder : T.border}`, borderRadius: T.radiusSm, padding: "12px 14px", transition: "all 0.15s" }}>
      <input type="checkbox" checked={selected} onChange={onChange} className="sr-only"/>
      <div className="ck-box" data-on={String(selected)} aria-hidden="true">
        {selected && <Check size={12} color="#000" strokeWidth={3} />}
      </div>
      <CondIcon icon={icon} size={18} color={selected ? T.green : T.textTertiary} />
      <span style={{ fontSize: 14, fontWeight: selected ? 500 : 400, color: selected ? T.text : T.textSecondary }}>{condition}</span>
    </label>
  );
}

function Disclaimer() {
  return (
    <div role="note" aria-label="Medical disclaimer" style={{
      background: T.surface1, border: "1px solid " + T.border, borderRadius: T.radiusSm,
      padding: "10px 14px", display: "flex", gap: 10, alignItems: "flex-start",
    }}>
      <ShieldAlert size={16} color={T.textTertiary} strokeWidth={1.8} style={{ flexShrink: 0, marginTop: 1 }}/>
      <p style={{ fontSize: 11, color: T.textTertiary, margin: 0, lineHeight: 1.55, fontWeight: 400 }}>
        Aurora Health is for informational purposes only and does not provide medical advice, diagnosis, or treatment. Always consult a qualified health professional about any concerns.
      </p>
    </div>
  );
}

function AllClearSummary({ count }) {
  return (
    <div className="m-card" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
      <CircleCheckBig size={24} color={T.green} strokeWidth={1.5}/>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: T.text }}>All clear today</div>
        <div style={{ fontSize: 12, color: T.textTertiary, fontWeight: 400 }}>
          {count === 1 ? "Your tracked condition shows" : `All ${count} tracked conditions show`} no elevated risk from current solar activity.
        </div>
      </div>
    </div>
  );
}

function Logo({ size = 40, style: sx = {} }) {
  return <img src={LOGO_URI} alt="Aurora Health" width={size} height={size}
    style={{ borderRadius: size * 0.28, objectFit: "cover", display: "block", flexShrink: 0, ...sx }}
    onError={e => { e.currentTarget.style.display = "none"; }}/>;
}

function LearnCard({ title, body, color, citations }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="m-card" style={{ borderColor: open ? (color + "44") : undefined, boxShadow: open ? T.elevation2 : T.elevation1 }}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{ width: "100%", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, padding: 0, fontFamily: font, textAlign: "left" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{ width: 4, height: 20, borderRadius: 2, background: color, flexShrink: 0 }}/>
          <span style={{ fontSize: 14, fontWeight: 600, color: T.text, lineHeight: 1.4 }}>{title}</span>
        </div>
        <span style={{ color: "rgba(255,255,255,0.2)", width: 16, height: 16, display: "inline-flex", flexShrink: 0, marginTop: 2, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}>
          <ChevronDown size={16} strokeWidth={2}/>
        </span>
      </button>
      {open && (
        <div style={{ marginTop: 14, borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
          <p style={{ fontSize: 13, color: T.textSecondary, margin: 0, lineHeight: 1.7, fontWeight: 400 }}>{body}</p>
          {citations && citations.length > 0 && (
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: T.textTertiary, letterSpacing: "0.06em", textTransform: "uppercase" }}>Sources</div>
              {citations.map((c, i) => (
                <a
                  key={i}
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 12, color: T.purple, textDecoration: "none", display: "flex", alignItems: "flex-start", gap: 6, lineHeight: 1.45, fontWeight: 400, transition: "color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.color = T.rose}
                  onMouseLeave={e => e.currentTarget.style.color = T.purple}
                >
                  <ExternalLink size={12} strokeWidth={1.8} style={{ flexShrink: 0, marginTop: 2 }}/>
                  <span>{c.label}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
export default function AuroraHealth() {
  const [solar, setSolar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [isLiveData, setIsLiveData] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [expanded, setExpanded] = useState(null);
  const [dismissed, setDismissed] = useState([]);
  const defaultPrefs = { name: "", conditions: ["Migraines","Heart Health","Mental Health"], sensitivity: "Medium", apiKey: "", onboarded: false };

  const [prefs, setPrefs] = useState(() => {
    try {
      const stored = localStorage.getItem("aurora_prefs");
      return stored ? { ...defaultPrefs, ...JSON.parse(stored) } : defaultPrefs;
    } catch { return defaultPrefs; }
  });
  const [step, setStep] = useState(1);
  const [oName, setOName] = useState("");
  const [oConds, setOConds] = useState(["Migraines","Heart Health","Mental Health"]);
  const [oSens, setOSens] = useState("Medium");
  const [tipIndex] = useState(() => Math.floor(Math.random() * DID_YOU_KNOW.length));
  const mainRef = useRef(null);
  const nameRef = useRef(null);
  const save = useCallback(p => {
    setPrefs(p);
    try { localStorage.setItem("aurora_prefs", JSON.stringify(p)); } catch {}
  }, []);

  const load = useCallback(async () => {
    setBusy(true);
    const d = await fetchSolar(prefs.apiKey);
    setSolar(d); setIsLiveData(!!d.live); setLoading(false); setBusy(false); setDismissed([]);
  }, [prefs.apiKey]);

  useEffect(() => { load(); }, []);
  useEffect(() => { if (mainRef.current) mainRef.current.focus({ preventScroll: true }); }, [tab]);
  useEffect(() => { if (!prefs.onboarded && step === 1 && nameRef.current) nameRef.current.focus(); }, [prefs.onboarded, step]);

  const risks = solar ? prefs.conditions.map(c => getRisk(c, solar.kpIndex, prefs.sensitivity)).filter(Boolean) : [];
  const alerts = risks.filter(r => r.level !== "low" && !dismissed.includes(r.condition));
  const highN = risks.filter(r => r.level === "high").length;
  const modN = risks.filter(r => r.level === "moderate").length;
  const overall = highN > 0 ? "high" : modN > 0 ? "moderate" : "low";

  useEffect(() => {
    const id = "aurora-css-v3";
    if (!document.getElementById(id)) { const s = document.createElement("style"); s.id = id; s.textContent = CSS; document.head.appendChild(s); }
    return () => { const el = document.getElementById(id); if (el) el.remove(); };
  }, []);

  const today = new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" });

  // ── ONBOARDING ─────────────────────────────────────────────────────────
  if (!prefs.onboarded) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: font }}>
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at 30% 0%, rgba(69,219,168,0.07) 0%, transparent 50%), radial-gradient(ellipse at 70% 10%, rgba(167,139,250,0.07) 0%, transparent 50%), radial-gradient(ellipse at 50% 90%, rgba(244,114,182,0.04) 0%, transparent 35%)", pointerEvents: "none" }} aria-hidden="true"/>
      <main style={{ width: "100%", maxWidth: 400, position: "relative", zIndex: 1 }} role="main" aria-label="Aurora Health setup">

        {step === 1 && (
          <section className="fade-up" aria-labelledby="ob-t1">
            <Progress step={1} total={3}/>
            <div style={{ textAlign: "center", marginBottom: 30 }}>
              <Logo size={80} style={{ margin: "0 auto 18px" }}/>
              <h1 id="ob-t1" style={{ color: T.text, fontSize: 26, fontWeight: 600, margin: "0 0 8px", letterSpacing: "-0.02em" }}>Welcome to Aurora</h1>
              <p style={{ color: T.textSecondary, fontSize: 14, margin: 0, lineHeight: 1.65, fontWeight: 400 }}>
                Your personal solar health companion.<br/>Translating space weather into clear, actionable health insights.
              </p>
            </div>
            <label htmlFor="ob-name" style={{ display: "block", fontSize: 12, color: T.green, fontWeight: 500, letterSpacing: "0.04em", marginBottom: 8 }}>What should we call you?</label>
            <input id="ob-name" ref={nameRef} className="m-input" value={oName} onChange={e => setOName(e.target.value)} placeholder="Your name" autoComplete="given-name"
              onKeyDown={e => e.key === "Enter" && oName.trim() && setStep(2)} style={{ marginBottom: 16 }}/>
            <button className="btn-filled" style={{ background: T.green, color: "#000" }} onClick={() => oName.trim() && setStep(2)} disabled={!oName.trim()}>Get started</button>
          </section>
        )}

        {step === 2 && (
          <section className="fade-up" aria-labelledby="ob-t2">
            <Progress step={2} total={3}/>
            <h2 id="ob-t2" style={{ color: T.text, fontSize: 22, fontWeight: 600, margin: "0 0 4px" }}>Hello, {oName}</h2>
            <p style={{ color: T.textSecondary, fontSize: 14, margin: "0 0 20px", fontWeight: 400 }}>We'll show you how today's solar activity may affect these areas. You can change these anytime in settings.</p>
            <fieldset style={{ border: "none", padding: 0, margin: "0 0 22px" }}>
              <legend className="sr-only">Select health conditions</legend>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {ALL_CONDITIONS.map(c => { const ru = HEALTH_RULES.find(r => r.condition === c); return (
                  <CondCheck key={c} condition={c} icon={ru?.icon} selected={oConds.includes(c)} onChange={() => setOConds(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c])}/>
                ); })}
              </div>
            </fieldset>
            <button className="btn-filled" style={{ background: T.green, color: "#000" }} onClick={() => setStep(3)} disabled={oConds.length === 0}>
              {oConds.length === 0 ? "Select at least one condition" : "Next"}
            </button>
          </section>
        )}

        {step === 3 && (
          <section className="fade-up" aria-labelledby="ob-t3">
            <Progress step={3} total={3}/>
            <h2 id="ob-t3" style={{ color: T.text, fontSize: 22, fontWeight: 600, margin: "0 0 4px" }}>Your sensitivity</h2>
            <p style={{ color: T.textSecondary, fontSize: 14, margin: "0 0 20px", fontWeight: 400 }}>How responsive are you to environmental and atmospheric changes?</p>
            <fieldset style={{ border: "none", padding: 0, margin: "0 0 22px" }}>
              <legend className="sr-only">Select sensitivity</legend>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }} role="radiogroup">
                {[{v:"Low",d:"I rarely notice solar or atmospheric changes."},{v:"Medium",d:"I sometimes feel effects during strong storms."},{v:"High",d:"I am very sensitive to geomagnetic fluctuations."}].map(({v,d}) => (
                  <label key={v} style={{ background: oSens === v ? T.purpleSoft : T.surface1, border: `1px solid ${oSens === v ? T.purpleBorder : T.border}`, borderRadius: T.radiusSm, padding: "14px 16px", cursor: "pointer", transition: "all 0.15s", display: "block" }}>
                    <input type="radio" name="sens" value={v} checked={oSens === v} onChange={() => setOSens(v)} className="sr-only"/>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                      <span style={{ color: T.text, fontWeight: 600, fontSize: 14 }}>{v}</span>
                      {oSens === v && <Check size={15} color={T.purple} strokeWidth={2.5} />}
                    </div>
                    <p style={{ color: T.textSecondary, fontSize: 13, margin: 0, fontWeight: 400 }}>{d}</p>
                  </label>
                ))}
              </div>
            </fieldset>
            <button className="btn-filled" style={{ background: `linear-gradient(135deg, ${T.purple}, ${T.rose})`, color: "#fff" }}
              onClick={() => save({ name: oName, conditions: oConds.length ? oConds : ["Migraines"], sensitivity: oSens, apiKey: "", onboarded: true })}>
              Start using Aurora
            </button>
          </section>
        )}
      </main>
    </div>
  );

  // ── MAIN APP ───────────────────────────────────────────────────────────
  const TABS = [{ id: "dashboard", label: "Today", Icon: Sun }, { id: "alerts", label: "Alerts", Icon: AlertTriangle }, { id: "learn", label: "Learn", Icon: BookOpen }, { id: "settings", label: "Settings", Icon: Settings }];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: font, color: T.text, maxWidth: 480, margin: "0 auto", position: "relative" }}>
      <a href="#main" className="skip-link">Skip to content</a>

      <div style={{ position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, height: "60%",
        background: "radial-gradient(ellipse at 25% 0%, rgba(69,219,168,0.05) 0%, transparent 50%), radial-gradient(ellipse at 75% 0%, rgba(167,139,250,0.05) 0%, transparent 50%), radial-gradient(ellipse at 50% 0%, rgba(244,114,182,0.03) 0%, transparent 40%)",
        pointerEvents: "none", zIndex: 0 }} aria-hidden="true"/>

      {/* HEADER */}
      <header style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(6,11,22,0.92)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${T.border}`, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <Logo size={38}/>
          <div style={{ fontSize: 17, fontWeight: 600, color: T.text, letterSpacing: "-0.01em", lineHeight: 1.2 }}>
            Hello, {prefs.name || "Explorer"}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <RiskBadge level={overall}/>
          <button onClick={load} disabled={busy} aria-label="Refresh solar data"
            style={{ width: 36, height: 36, borderRadius: T.radiusSm, background: T.surface1, border: `1px solid ${T.border}`, color: busy ? T.green : T.textSecondary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", animation: busy ? "spin 0.8s linear infinite" : "none" }}>
            <RefreshCw size={16} strokeWidth={1.8} />
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <main id="main" ref={mainRef} tabIndex={-1} style={{ padding: "16px 16px 100px", position: "relative", zIndex: 1, outline: "none" }}
        aria-label={tab === "dashboard" ? "Today's solar health" : tab === "alerts" ? "Health alerts" : tab === "learn" ? "The science" : "Settings"}>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }} role="status">
            <div style={{ color: T.green, fontSize: 14, fontWeight: 400, animation: "pulse 1.5s infinite" }}>Scanning solar activity…</div>
          </div>
        ) : (<>

          {/* ════ DASHBOARD ════ */}
          {tab === "dashboard" && solar && (
            <div className="fade-up">
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p style={{ fontSize: 13, color: T.textTertiary, fontWeight: 400, margin: 0 }}>{today}</p>
                  {!isLiveData && !prefs.apiKey && <span style={{ fontSize: 10, fontWeight: 600, color: T.amber, background: T.amberSoft, border: "1px solid " + T.amberBorder, borderRadius: 6, padding: "2px 8px" }}>Sample data</span>}
                </div>
                <h1 style={{ fontSize: 20, fontWeight: 600, color: T.text, margin: "2px 0 0" }}>How space weather may affect you today</h1>
              </div>

              {/* 1 — ALERTS */}
              {alerts.length > 0 && (
                <section aria-label="Active alerts" style={{ marginBottom: 20 }}>
                  <div className="section-title" style={{ color: T.red }}>⚠ Active alerts</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {alerts.map((r, i) => <div key={r.condition} className="fade-up" style={{ animationDelay: `${i * 0.05}s` }}><AlertCard r={r} onDismiss={() => setDismissed(d => [...d, r.condition])}/></div>)}
                  </div>
                </section>
              )}

              {/* 2 — HEALTH CONDITIONS */}
              <section aria-label="Health conditions" style={{ marginBottom: 20 }}>
                <div className="section-title">Conditions you're tracking</div>
                {risks.length > 0 && risks.every(r => r.level === "low") ? (
                  <AllClearSummary count={risks.length}/>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {risks.map((r, i) => <div key={r.condition} className="fade-up" style={{ animationDelay: `${0.05 + i * 0.04}s` }}><HealthCard r={r} open={expanded === r.condition} onToggle={() => setExpanded(expanded === r.condition ? null : r.condition)}/></div>)}
                  </div>
                )}
              </section>

              {/* 3 — SOLAR ACTIVITY */}
              <section aria-label="Solar activity" className="m-card" style={{ borderRadius: 20, padding: 18, marginBottom: 16, boxShadow: T.elevation2 }}>
                <SolarActivityBar kp={solar.kpIndex}/>
              </section>

              {/* 4 — DID YOU KNOW */}
              <aside className="m-card" style={{ padding: "14px 16px" }} aria-label="Fact">
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <Sparkles size={14} color={T.purple} strokeWidth={1.8} />
                  <span style={{ fontSize: 11, color: T.purple, fontWeight: 600 }}>Did you know</span>
                </div>
                <p style={{ fontSize: 13, color: T.textSecondary, margin: 0, lineHeight: 1.65, fontWeight: 400 }}>
                  {DID_YOU_KNOW[tipIndex]}
                </p>
              </aside>

              {/* 5 — DISCLAIMER */}
              <div style={{ marginTop: 12 }}>
                <Disclaimer/>
              </div>
            </div>
          )}

          {/* ════ ALERTS ════ */}
          {tab === "alerts" && (
            <div className="fade-up">
              <div className="section-title">All health alerts</div>
              {risks.filter(r => r.level !== "low").length === 0 ? (
                <div style={{ textAlign: "center", padding: "56px 0" }} role="status">
                  <CircleCheckBig size={44} color={T.green} strokeWidth={1.5} style={{ margin: "0 auto 12px", display: "block" }} />
                  <div style={{ fontSize: 16, color: T.textSecondary, fontWeight: 500, marginBottom: 4 }}>All clear</div>
                  <div style={{ fontSize: 13, color: T.textTertiary, fontWeight: 400 }}>All your conditions are at low risk today</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {risks.filter(r => r.level !== "low").sort((a, b) => a.level === "high" ? -1 : 1).map((r, i) =>
                    <div key={r.condition} className="fade-up" style={{ animationDelay: `${i * 0.05}s` }}><AlertCard r={r}/></div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ════ LEARN ════ */}
          {tab === "learn" && (
            <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ marginBottom: 2 }}>
                <h1 style={{ fontSize: 20, fontWeight: 600, color: T.text, margin: "0 0 4px" }}>The science</h1>
                <p style={{ fontSize: 13, color: T.textSecondary, margin: 0, lineHeight: 1.55, fontWeight: 400 }}>
                  How space weather connects to your wellbeing — and the research behind Aurora's insights.
                </p>
              </div>

              {/* LIVE DATA DASHBOARD */}
              {solar && (
                <section className="m-card" style={{ borderRadius: 20, padding: 20, boxShadow: T.elevation2 }} aria-label="Current space weather data">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <Activity size={16} color={T.green} strokeWidth={1.8}/>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.green }}>Live space weather data</span>
                    {isLiveData && <span style={{ fontSize: 10, color: T.textTertiary, fontWeight: 400, marginLeft: "auto" }}>via Bureau of Meteorology</span>}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
                    <div style={{ background: T.surface2, borderRadius: T.radiusSm, padding: "12px 14px", textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: T.textTertiary, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>Kp index</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: solarScale(solar.kpIndex).color, lineHeight: 1 }}>{solar.kpIndex}</div>
                      <div style={{ fontSize: 11, color: T.textTertiary, marginTop: 3, fontWeight: 400 }}>{kpLabel(solar.kpIndex)}</div>
                    </div>
                    <div style={{ background: T.surface2, borderRadius: T.radiusSm, padding: "12px 14px", textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: T.textTertiary, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>A-index</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: T.purple, lineHeight: 1 }}>{solar.aIndex ?? "—"}</div>
                      <div style={{ fontSize: 11, color: T.textTertiary, marginTop: 3, fontWeight: 400 }}>Daily activity</div>
                    </div>
                    <div style={{ background: T.surface2, borderRadius: T.radiusSm, padding: "12px 14px", textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: T.textTertiary, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>Overall</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: rk[overall].text, lineHeight: 1 }}>
                        <Gauge size={24} strokeWidth={1.8}/>
                      </div>
                      <div style={{ fontSize: 11, color: rk[overall].text, marginTop: 3, fontWeight: 500, textTransform: "capitalize" }}>{overall === "low" ? "All clear" : overall}</div>
                    </div>
                  </div>

                  <SolarActivityBar kp={solar.kpIndex}/>

                  <div style={{ marginTop: 14, borderTop: "1px solid " + T.border, paddingTop: 12 }}>
                    <p style={{ fontSize: 12, color: T.textTertiary, margin: 0, lineHeight: 1.55, fontWeight: 400 }}>
                      This is the raw data Aurora uses to generate your health insights. The Kp index measures disturbance in Earth's magnetic field on a 0–9 scale. The A-index summarises daily geomagnetic activity. Your sensitivity setting adjusts how these values translate into the alerts you see on the Today tab.
                    </p>
                  </div>
                </section>
              )}

              <LearnCard
                title="What is a geomagnetic storm?"
                body="The sun regularly releases bursts of charged particles called coronal mass ejections (CMEs). When these reach Earth, they interact with our planet's magnetic field, causing temporary disturbances called geomagnetic storms. These are measured on the Kp index — a scale from 0 (calm) to 9 (extreme). Aurora translates this scale into plain language so you don't need to interpret the numbers yourself."
                color={T.green}
              />

              <LearnCard
                title="How can solar weather affect my body?"
                body="Your body runs on electrical signals and biological rhythms. Research suggests that fluctuations in Earth's magnetic field during geomagnetic storms can subtly influence these systems — particularly melatonin production (the hormone that regulates your sleep cycle), heart rate variability, blood pressure, and nervous system activity. Not everyone is equally sensitive, but those who are may notice changes in sleep, energy, mood, or pain levels during active solar periods."
                color={T.purple}
              />

              <LearnCard
                title="Sleep and melatonin"
                body="One of the most studied connections is between geomagnetic activity and melatonin — the hormone your pineal gland produces to regulate sleep. Research at high latitudes found that geomagnetic disturbances above 80 nT significantly reduced melatonin concentration. A separate study of 153 workers found that elevated geomagnetic activity was consistently associated with lower overnight melatonin output. This may explain why some people experience insomnia or restless sleep during solar storms."
                color={T.rose}
                citations={[
                  { label: "Weydahl et al. (2001) — Geomagnetic activity influences melatonin secretion at latitude 70°N", url: "https://www.sciencedirect.com/science/article/abs/pii/S075333220190006X" },
                  { label: "Burch et al. (2008) — Geomagnetic activity and human melatonin metabolite excretion", url: "https://pubmed.ncbi.nlm.nih.gov/18981356/" },
                ]}
              />

              <LearnCard
                title="Heart health and cardiovascular risk"
                body="A 2024 systematic review and meta-analysis found that geomagnetic storms were associated with a 30–50% increase in relative risk of heart attack and acute coronary syndrome, and a 25–60% increase in stroke risk. A large-scale study from São Paulo analysing hospital admissions from 1998–2005 found significantly more cardiac events during high Kp-index days — with women over 30 showing the greatest sensitivity."
                color={T.red}
                citations={[
                  { label: "PMC Meta-analysis (2024) — GS influence on MI, ACS & stroke risk", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12005662/" },
                  { label: "Communications Medicine (2024) — Solar storms and cardiac admissions in Brazil", url: "https://www.foxweather.com/earth-space/health-study-impact-solar-geomagnetic-storms" },
                ]}
              />

              <LearnCard
                title="Migraines and headaches"
                body="Geomagnetic disturbances may trigger migraines through several pathways: disrupting melatonin and serotonin production, altering blood flow in the brain via the trigeminovascular system, and shifting autonomic nervous system balance. A study published in Cephalalgia found significantly higher migraine frequency during geomagnetic storms, and a PMC review confirmed correlations between storm intensity and episodes of moderate-to-severe migraine."
                color={T.amber}
                citations={[
                  { label: "PMC Review (2023) — Biological effects of magnetic storms", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10740910/" },
                ]}
              />

              <LearnCard
                title="Mental health and mood"
                body="Research has found statistical links between geomagnetic activity and increased anxiety, irritability, and depressive episodes. The proposed mechanism involves disruption to the brain's electrical activity and neurotransmitter balance — particularly serotonin and melatonin. A 2025 laboratory study found that moderate geomagnetic storms actually protected against depressive behaviour in animal models by activating melatonin pathways, while extreme storms had the opposite effect."
                color={T.purple}
                citations={[
                  { label: "ScienceDirect (2025) — Geomagnetic storm effects on depression mechanisms", url: "https://www.sciencedirect.com/science/article/pii/S0361923025001819" },
                  { label: "Babayev (2007) — Geomagnetic activity effects on psychological state", url: "https://www.sciencedirect.com/science/article/abs/pii/S0273117707009404" },
                ]}
              />

              <LearnCard
                title="Who is most affected?"
                body="Not everyone will notice the effects of space weather. Research suggests those most likely to be sensitive include people with pre-existing cardiovascular conditions, people who experience migraines, those with sleep disorders or disrupted circadian rhythms, people living at higher geomagnetic latitudes, and individuals who are already stressed or sleep-deprived. Aurora helps you track which conditions matter to you and provides personalised guidance based on current solar activity."
                color={T.green}
              />

              <LearnCard
                title="A note on the science"
                body="This is an active area of research. While many studies show correlations between geomagnetic activity and health effects, establishing definitive cause-and-effect is complex. The mechanisms are still being investigated, and some findings are debated within the scientific community. Aurora presents the best available evidence to help you stay informed — not to diagnose or replace medical advice. If you have concerns about your health, always consult a healthcare professional."
                color={T.textTertiary}
              />
            </div>
          )}

          {/* ════ SETTINGS ════ */}
          {tab === "settings" && (
            <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <section aria-labelledby="s-profile">
                <h2 id="s-profile" className="section-title">Profile</h2>
                <div className="m-card">
                  <label htmlFor="s-name" style={{ display: "block", fontSize: 12, color: T.green, fontWeight: 500, marginBottom: 8 }}>Name</label>
                  <input id="s-name" className="m-input" value={prefs.name} onChange={e => save({ ...prefs, name: e.target.value })} autoComplete="given-name"/>
                </div>
              </section>

              <section aria-labelledby="s-conds">
                <h2 id="s-conds" className="section-title">Tracked conditions</h2>
                <fieldset style={{ border: "none", padding: 0 }}>
                  <legend className="sr-only">Select conditions</legend>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {ALL_CONDITIONS.map(c => { const ru = HEALTH_RULES.find(r => r.condition === c); return (
                      <CondCheck key={c} condition={c} icon={ru?.icon} selected={prefs.conditions.includes(c)}
                        onChange={() => save({ ...prefs, conditions: prefs.conditions.includes(c) ? prefs.conditions.filter(x => x !== c) : [...prefs.conditions, c] })}/>
                    ); })}
                  </div>
                </fieldset>
              </section>

              <section aria-labelledby="s-sens">
                <h2 id="s-sens" className="section-title" style={{ color: T.purple }}>Sensitivity level</h2>
                <div className="m-card">
                  <fieldset style={{ border: "none", padding: 0 }}>
                    <legend className="sr-only">Sensitivity</legend>
                    <div style={{ display: "flex", gap: 8 }} role="radiogroup">
                      {["Low","Medium","High"].map(v => (
                        <label key={v} style={{ flex: 1 }}>
                          <input type="radio" name="s-sens" value={v} checked={prefs.sensitivity === v} onChange={() => save({ ...prefs, sensitivity: v })} className="sr-only"/>
                          <div style={{ padding: "11px 0", borderRadius: T.radiusSm, textAlign: "center", border: `1px solid ${prefs.sensitivity === v ? T.purpleBorder : T.border}`, background: prefs.sensitivity === v ? T.purpleSoft : "transparent", color: prefs.sensitivity === v ? T.purple : T.textTertiary, fontWeight: 500, fontSize: 13, cursor: "pointer", transition: "all 0.15s" }}>{v}</div>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>
              </section>

              <section aria-labelledby="s-api">
                <h2 id="s-api" className="section-title">Data source</h2>
                <div className="m-card">
                  <label htmlFor="s-key" style={{ display: "block", fontSize: 12, color: T.green, fontWeight: 500, marginBottom: 4 }}>SWS API key (optional)</label>
                  <p id="s-key-desc" style={{ fontSize: 12, color: T.textTertiary, margin: "0 0 10px", lineHeight: 1.5, fontWeight: 400 }}>Add your free Bureau of Meteorology Space Weather API key to get live solar data. <a href="https://sws-data.sws.bom.gov.au/register" target="_blank" rel="noopener noreferrer" style={{ color: T.purple, textDecoration: "none", fontWeight: 500 }}>Register here</a> — it's free and instant.</p>
                  <input id="s-key" type="password" className="m-input" value={prefs.apiKey || ""} onChange={e => save({ ...prefs, apiKey: e.target.value })} placeholder="Your SWS API key" aria-describedby="s-key-desc" autoComplete="off"/>
                </div>
              </section>

              <a href="https://buymeacoffee.com/aurorahealth" target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", background: "rgba(255,221,0,0.08)", border: "1px solid rgba(255,221,0,0.20)", borderRadius: T.radius, padding: 14, fontSize: 14, fontWeight: 500, color: "#ffdd00", textDecoration: "none", transition: "background 0.15s, border-color 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,221,0,0.14)"; e.currentTarget.style.borderColor = "rgba(255,221,0,0.35)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,221,0,0.08)"; e.currentTarget.style.borderColor = "rgba(255,221,0,0.20)"; }}>
                <span style={{ fontSize: 18 }}>☕</span> Buy me a coffee
              </a>

            </div>
          )}
        </>)}
      </main>

      {/* TAB BAR */}
      <nav className="tab-bar" role="tablist" aria-label="Navigation">
        {TABS.map(t => {
          const active = tab === t.id;
          const n = t.id === "alerts" ? alerts.length : 0;
          return (
            <button key={t.id} className="tab-btn" role="tab" aria-selected={active}
              aria-label={`${t.label}${n > 0 ? `, ${n} alerts` : ""}`} onClick={() => setTab(t.id)}>
              <t.Icon size={22} color={active ? T.green : T.textTertiary} strokeWidth={1.8} />
              <span>{t.label}</span>
              {n > 0 && <span className="badge-count" aria-hidden="true">{n}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
