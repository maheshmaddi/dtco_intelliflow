import { useState } from "react";

const C = {
  bg: "#0f0e1a", card: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.07)",
  purple: "#7c6fff", green: "#3ecf8e", orange: "#ff9f43", red: "#ff6b6b",
  blue: "#54a0ff", lavender: "#a29bfe", text: "#e8e6ff", muted: "#9997bb", dim: "#6664a0",
};

const Tag = ({ children, color }) => (
  <span style={{ background: (color||C.purple)+"18", border:`1px solid ${color||C.purple}35`, color:color||C.purple, borderRadius:20, padding:"2px 9px", fontSize:10, fontWeight:700 }}>{children}</span>
);
const Mono = ({ children }) => (
  <code style={{ background:C.purple+"18", color:C.lavender, padding:"1px 5px", borderRadius:4, fontSize:11 }}>{children}</code>
);
const Card = ({ children, style }) => (
  <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:"14px 16px", marginBottom:12, ...style }}>{children}</div>
);
const Info = ({ children }) => (
  <div style={{ background:C.purple+"0a", border:`1px solid ${C.purple}25`, borderRadius:8, padding:"10px 14px", fontSize:12, color:C.muted, lineHeight:1.7, marginBottom:10 }}>{children}</div>
);
const Note = ({ children }) => <p style={{ fontSize:11, color:C.purple, margin:"6px 0 0", opacity:0.8 }}>ℹ {children}</p>;
const Lbl = ({ children }) => (
  <div style={{ fontSize:9, color:C.dim, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:6 }}>{children}</div>
);
const Btn = ({ label, color, primary, disabled, onClick }) => (
  <button onClick={onClick} disabled={disabled} style={{ background:primary?color:"transparent", border:`1px solid ${color}`, color:primary?"#0f0e1a":color, padding:"8px 16px", borderRadius:8, fontSize:12, fontWeight:700, cursor:disabled?"not-allowed":"pointer", opacity:disabled?0.4:1 }}>{label}</button>
);
const RevTab = ({ version, active, onClick }) => (
  <button onClick={onClick} style={{ background:active?C.purple+"25":"transparent", border:`1px solid ${active?C.purple:C.border}`, color:active?C.lavender:C.dim, padding:"4px 14px", borderRadius:20, fontSize:12, fontWeight:600, cursor:"pointer" }}>{version}</button>
);
const PhaseHeader = ({ icon, title, subtitle, color }) => (
  <div style={{ marginBottom:24, paddingBottom:16, borderBottom:`1px solid ${C.border}` }}>
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
      <span style={{ fontSize:20, color:color||C.purple }}>{icon}</span>
      <h2 style={{ margin:0, fontSize:19, fontWeight:700, color:C.text }}>{title}</h2>
    </div>
    <p style={{ margin:0, fontSize:12, color:C.muted, paddingLeft:32 }}>{subtitle}</p>
  </div>
);
const Step = ({ n, title, children }) => (
  <div style={{ marginBottom:22 }}>
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
      <div style={{ width:20, height:20, borderRadius:"50%", background:C.purple+"18", border:`1px solid ${C.purple}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, color:C.purple, fontWeight:700, flexShrink:0 }}>{n}</div>
      <h4 style={{ margin:0, fontSize:13, fontWeight:600, color:C.text }}>{title}</h4>
    </div>
    <div style={{ paddingLeft:28 }}>{children}</div>
  </div>
);
const CommentBox = ({ placeholder }) => (
  <textarea placeholder={placeholder} style={{ width:"100%", minHeight:68, background:C.card, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:12, padding:"10px 12px", resize:"vertical", fontFamily:"inherit", boxSizing:"border-box", marginTop:8 }} />
);
const SectionTitle = ({ children }) => (
  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
    <div style={{ width:3, height:14, background:C.purple, borderRadius:2 }} />
    <span style={{ fontSize:11, fontWeight:700, color:"#c4c2e8", letterSpacing:"0.07em", textTransform:"uppercase" }}>{children}</span>
  </div>
);
const QCard = ({ q, answered, onAnswer }) => (
  <div style={{ background:answered?C.green+"0a":C.orange+"0d", border:`1px solid ${answered?C.green+"30":C.orange+"40"}`, borderRadius:8, padding:"9px 12px", marginBottom:7, display:"flex", gap:10, alignItems:"flex-start" }}>
    <div style={{ flex:1 }}>
      <div style={{ fontSize:9, fontWeight:700, color:answered?C.green:C.orange, textTransform:"uppercase", letterSpacing:"0.05em" }}>{answered?"✓ Answered":"⚑ AI Question"}</div>
      <p style={{ margin:"3px 0 0", fontSize:12, color:C.text, lineHeight:1.6 }}>{q}</p>
    </div>
    {!answered && <button onClick={onAnswer} style={{ background:C.orange+"18", border:`1px solid ${C.orange}40`, color:C.orange, padding:"4px 10px", borderRadius:6, fontSize:10, cursor:"pointer", flexShrink:0 }}>Answer</button>}
  </div>
);
const ProgressBar = ({ label, pct, color }) => (
  <div style={{ marginTop:10, marginBottom:8 }}>
    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
      <span style={{ fontSize:11, color:C.muted }}>{label}</span>
      <span style={{ fontSize:11, color:color||C.purple }}>{pct}%</span>
    </div>
    <div style={{ height:4, background:"rgba(255,255,255,0.06)", borderRadius:2 }}>
      <div style={{ height:"100%", width:`${pct}%`, background:color||C.purple, borderRadius:2 }} />
    </div>
  </div>
);
const SpecTable = ({ rows }) => (
  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
    <thead><tr>{["UI Zone","Content / Purpose"].map(h=><th key={h} style={{ textAlign:"left", color:C.purple, padding:"5px 10px", borderBottom:`1px solid ${C.purple}22` }}>{h}</th>)}</tr></thead>
    <tbody>{rows.map(([z,c],i)=>(
      <tr key={i} style={{ background:i%2===0?"rgba(255,255,255,0.01)":"transparent" }}>
        <td style={{ padding:"6px 10px", color:C.lavender, fontWeight:600, width:"30%" }}>{z}</td>
        <td style={{ padding:"6px 10px", color:C.muted }}>{c}</td>
      </tr>
    ))}</tbody>
  </table>
);

// ── Overview ──────────────────────────────────────────────────────────────────
function OverviewPanel() {
  const flow = [
    { n:1, label:"Add Git Project", sub:"Clone & index", color:C.purple },
    { n:2, label:"Create Feature", sub:"Name + req doc", color:C.purple },
    { n:3, label:"Architecture", sub:"Q&A → Plan → Approve", color:C.purple },
    { n:4, label:"Development", sub:"Branch → Code → Push", color:C.blue },
    { n:5, label:"Code Review", sub:"Findings → Fix → PR", color:C.red },
    { n:6, label:"Testing", sub:"Plan → Approve → Tests", color:C.green },
  ];
  const cmds = [
    ["/arch-analyze","Architecture","Req doc + codebase → clarifying Qs → plan + diagrams"],
    ["/arch-replan","Architecture","Previous plan + comments → next revision"],
    ["/dev-implement","Development","Approved arch plan → code changes across codebase"],
    ["/dev-verify","Development","Cross-check implementation vs architecture plan"],
    ["/dev-summarize","Development","Structured summary of all changes made"],
    ["/review-analyze","Code Review","Branch diff → security, perf, quality, arch compliance findings"],
    ["/review-fix","Code Review","Auto-fix a specific finding by ID, re-compile & verify"],
    ["/review-pr","Code Review","Create PR with auto-generated description from summary + findings"],
    ["/test-plan","Testing","Generate test case plan from req doc + architecture"],
    ["/test-implement","Testing","Write actual test files for approved test plan"],
  ];
  const phaseColors = { Architecture:C.purple, Development:C.blue, "Code Review":C.red, Testing:C.green };
  return (
    <div>
      <h2 style={{ fontSize:20, fontWeight:700, color:C.text, marginBottom:4 }}>AI Feature Lifecycle — Blueprint</h2>
      <p style={{ color:C.muted, fontSize:12, marginBottom:28, lineHeight:1.7 }}>OpenClaw-powered SDLC tool with Architecture → Development → Code Review → Testing phases, versioned revision history, and human-in-the-loop approval gates at every phase transition.</p>
      <SectionTitle>End-to-End Flow</SectionTitle>
      <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:28, alignItems:"center" }}>
        {flow.map((item,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ background:item.color+"12", border:`1px solid ${item.color}28`, borderRadius:8, padding:"8px 11px", textAlign:"center", minWidth:90 }}>
              <div style={{ fontSize:9, color:item.color, fontWeight:700 }}>Step {item.n}</div>
              <div style={{ fontSize:11, color:C.text, fontWeight:600, marginTop:2 }}>{item.label}</div>
              <div style={{ fontSize:9, color:C.dim, marginTop:2 }}>{item.sub}</div>
            </div>
            {i<flow.length-1 && <span style={{ color:"#3a384f", fontSize:14 }}>→</span>}
          </div>
        ))}
      </div>
      <SectionTitle>OpenClaw Custom Commands</SectionTitle>
      <Card style={{ marginBottom:28 }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
          <thead><tr>{["Command","Phase","Description"].map(h=><th key={h} style={{ textAlign:"left", color:C.purple, padding:"5px 10px", borderBottom:`1px solid ${C.purple}22` }}>{h}</th>)}</tr></thead>
          <tbody>{cmds.map(([cmd,phase,desc],i)=>(
            <tr key={i} style={{ background:i%2===0?"rgba(255,255,255,0.01)":"transparent" }}>
              <td style={{ padding:"6px 10px" }}><Mono>{cmd}</Mono></td>
              <td style={{ padding:"6px 10px" }}><Tag color={phaseColors[phase]}>{phase}</Tag></td>
              <td style={{ padding:"6px 10px", color:C.muted }}>{desc}</td>
            </tr>
          ))}</tbody>
        </table>
      </Card>
      <SectionTitle>Key Design Principles</SectionTitle>
      <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
        {[
          { title:"Human-in-the-Loop Gates", color:C.red, items:["No phase advances without explicit Approve","All AI questions must be answered to unlock Approve","Reviewer can override findings with justification","Revision history is immutable — full audit trail"] },
          { title:"Versioned Everything", color:C.purple, items:["Architecture plan: v1, v2, ... revisions","Code Review findings: v1 (raw), v2 (post-fix)","Test case plan: v1, v2, ... revisions","All versions browsable at any time"] },
          { title:"File Upload Guard", color:C.blue, items:["Max 5 MB (configurable per project)","Accepted: PDF, DOCX, TXT, MD","Chunked → embedded → stored per feature","Re-upload triggers fresh analysis run"] },
          { title:"Data Model Entities", color:C.green, items:["Project, Feature, ArchRevision, DevRun","ReviewRevision, ReviewFinding, TestRevision","Comment (polymorphic — works on all phases)","PhaseTransition (audit log of approvals)"] },
        ].map(({ title, color, items })=>(
          <div key={title} style={{ flex:"1 1 200px", background:color+"08", border:`1px solid ${color}25`, borderRadius:10, padding:"12px 14px" }}>
            <div style={{ fontSize:11, fontWeight:700, color, marginBottom:10, textTransform:"uppercase", letterSpacing:"0.05em" }}>{title}</div>
            {items.map((it,i)=>(
              <div key={i} style={{ fontSize:11, color:C.muted, marginBottom:5, paddingLeft:10, position:"relative" }}>
                <span style={{ position:"absolute", left:0, color }}>›</span>{it}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Architecture ──────────────────────────────────────────────────────────────
function ArchitecturePanel() {
  const [rev, setRev] = useState(0);
  const [qa, setQa] = useState([false,false,false]);
  const [diagTab, setDiagTab] = useState(0);
  const revs = [
    { v:"v1", date:"2026-03-28", status:"Pending Approval", summary:"Initial architecture plan based on requirement analysis. Covers API contracts, data model, phase state machine, and file upload flow." },
    { v:"v2", date:"2026-03-29", status:"Pending Approval", summary:"Revised after architect feedback: async job queue added for OpenClaw runs, Redis cache layer for revision reads, S3 for uploaded documents." },
  ];
  const questions = [
    "Should the file upload service use S3 or local disk storage in production?",
    "Is the compile step expected to support multiple languages or only the current stack?",
    "Should revision history be soft-deleted or permanently retained?",
  ];
  const allOk = qa.every(Boolean);
  return (
    <div>
      <PhaseHeader icon="⬡" title="Architecture Phase" subtitle="Upload requirements → AI Q&A → Architecture plan with diagrams → Architect review → Approve" />
      <Step n="1" title="Requirement Document Upload">
        <div style={{ border:`1.5px dashed ${C.purple}40`, borderRadius:10, padding:20, textAlign:"center", background:C.purple+"05", cursor:"pointer" }}>
          <div style={{ fontSize:22, marginBottom:6 }}>📄</div>
          <div style={{ fontSize:12, color:C.muted, marginBottom:4 }}>Drop requirement document here or click to browse</div>
          <div style={{ fontSize:10, color:C.dim }}>PDF · DOCX · TXT · MD · Max 5 MB</div>
        </div>
        <Note>Re-upload replaces the document and triggers a new analysis run.</Note>
      </Step>
      <Step n="2" title="AI Clarification Questions">
        <p style={{ fontSize:12, color:C.muted, marginBottom:10 }}>OpenClaw asks questions until requirements are fully justified. <span style={{ color:"#ffd43b", fontWeight:600 }}>All must be answered before plan generation.</span></p>
        {questions.map((q,i)=><QCard key={i} q={q} answered={qa[i]} onAnswer={()=>{ const u=[...qa]; u[i]=true; setQa(u); }} />)}
      </Step>
      <Step n="3" title="Architecture Plan — Revisions">
        <div style={{ display:"flex", gap:7, marginBottom:12 }}>
          {revs.map((r,i)=><RevTab key={i} version={r.v} active={rev===i} onClick={()=>setRev(i)} />)}
        </div>
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <span style={{ color:C.purple, fontWeight:700, fontSize:13 }}>Revision {revs[rev].v}</span>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <Tag color={C.orange}>{revs[rev].status}</Tag>
              <span style={{ fontSize:11, color:C.dim }}>{revs[rev].date}</span>
            </div>
          </div>
          <p style={{ fontSize:12, color:C.muted, lineHeight:1.7, margin:"0 0 10px" }}>{revs[rev].summary}</p>
          <div style={{ background:"rgba(255,255,255,0.02)", borderRadius:6, padding:"10px 12px", fontSize:11, color:C.dim }}>[ Full markdown plan: components, data flow, API contracts, technology decisions, non-functional requirements ]</div>
        </Card>
        <div style={{ marginBottom:12 }}>
          <div style={{ display:"flex", gap:6, marginBottom:8 }}>
            {["Sequence Diagram","State Chart"].map((t,i)=>(
              <button key={i} onClick={()=>setDiagTab(i)} style={{ background:diagTab===i?C.blue+"18":"transparent", border:`1px solid ${diagTab===i?C.blue:C.border}`, color:diagTab===i?"#74b9ff":C.dim, padding:"4px 12px", borderRadius:6, fontSize:11, cursor:"pointer" }}>{t}</button>
            ))}
          </div>
          <div style={{ height:90, background:C.blue+"06", border:`1px dashed ${C.blue}25`, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:C.blue, fontSize:11, opacity:0.6 }}>
            Mermaid {["Sequence Diagram","State Chart"][diagTab]} rendered here
          </div>
        </div>
        <CommentBox placeholder="Architect comments on this revision…" />
        <div style={{ display:"flex", gap:10, marginTop:12 }}>
          <Btn label="↺  Send for Revision" color={C.orange} disabled={!allOk} />
          <Btn label="✓  Approve → Development" color={C.green} primary disabled={!allOk} />
        </div>
        {!allOk && <p style={{ color:C.red, fontSize:11, marginTop:6 }}>⚠ {qa.filter(x=>!x).length} unanswered question(s) — answer all before approving.</p>}
      </Step>
      <Step n="●" title="UI Layout Spec">
        <SpecTable rows={[
          ["Left sidebar","Phase navigator + revision version list"],
          ["Center panel","Active revision plan (markdown rendered)"],
          ["Right panel","AI questions (amber), comment thread, actions"],
          ["Diagram area","Mermaid tabs: Sequence + State Chart"],
          ["Footer strip","Revision timeline (v1 → v2 → ...)"],
        ]} />
      </Step>
    </div>
  );
}

// ── Development ───────────────────────────────────────────────────────────────
function DevelopmentPanel() {
  const [step, setStep] = useState(0);
  const steps = ["Create Branch","Implement","Compile & Fix","Verify Arch","Push & Summary"];
  return (
    <div>
      <PhaseHeader icon="⟨/⟩" title="Development Phase" subtitle="Branch → AI implements code → Compile → Verify architecture alignment → Push → Summary review" color={C.blue} />
      <div style={{ display:"flex", gap:5, marginBottom:22, flexWrap:"wrap" }}>
        {steps.map((s,i)=>(
          <button key={i} onClick={()=>setStep(i)} style={{ background:step===i?C.purple+"20":i<step?C.green+"12":"rgba(255,255,255,0.02)", border:`1px solid ${step===i?C.purple:i<step?C.green:C.border}`, color:step===i?C.lavender:i<step?C.green:C.dim, padding:"5px 12px", borderRadius:20, fontSize:11, fontWeight:600, cursor:"pointer" }}>
            {i<step?"✓ ":`${i+1}. `}{s}
          </button>
        ))}
      </div>
      {step===0 && (
        <Step n="1" title="Create Feature Branch">
          <Info>OpenClaw runs <Mono>git checkout -b feature/[name]</Mono> and pushes the empty branch to remote. Branch name is auto-generated from the feature title.</Info>
          <div style={{ display:"flex", gap:10, marginTop:10 }}>
            <div style={{ flex:2 }}><Lbl>Branch name (auto)</Lbl><div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:6, padding:"7px 10px", fontSize:11, color:C.muted, fontFamily:"monospace" }}>feature/arch-lifecycle-tool</div></div>
            <div style={{ flex:1 }}><Lbl>Base branch</Lbl><div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:6, padding:"7px 10px", fontSize:11, color:C.muted, fontFamily:"monospace" }}>main</div></div>
          </div>
          <div style={{ marginTop:12 }}><Btn label="▶  Create & Push Branch" color={C.purple} primary onClick={()=>setStep(1)} /></div>
        </Step>
      )}
      {step===1 && (
        <Step n="2" title="AI Code Implementation">
          <Info>OpenClaw runs <Mono>/dev-implement</Mono> — reads the approved architecture plan and implements all changes. Files are modified and committed incrementally.</Info>
          <ProgressBar label="Implementing… 14 / 22 files modified" pct={63} />
          <div style={{ background:"#0a0912", border:`1px solid ${C.border}`, borderRadius:8, padding:"12px 14px", fontFamily:"monospace", fontSize:11, marginTop:10 }}>
            {[{c:C.green,l:"+ src/arch/revision.ts — created"},{c:C.blue,l:"~ src/api/feature.ts — modified (4 hunks)"},{c:C.green,l:"+ src/upload/guard.ts — created"},{c:C.blue,l:"~ src/dev/runner.ts — modified (2 hunks)"}].map((r,i)=><div key={i} style={{ color:r.c, marginBottom:3 }}>{r.l}</div>)}
          </div>
          <div style={{ marginTop:12 }}><Btn label="Next: Compile →" color={C.blue} primary onClick={()=>setStep(2)} /></div>
        </Step>
      )}
      {step===2 && (
        <Step n="3" title="Compile & Error Fix Loop">
          <Info>OpenClaw runs the project build command, captures errors, and iteratively fixes them. Each fix re-runs compilation to verify.</Info>
          <div style={{ background:"#0a0912", border:`1px solid ${C.border}`, borderRadius:8, padding:"12px 14px", fontFamily:"monospace", fontSize:11, marginTop:10 }}>
            <div style={{ color:C.green }}>$ npm run build</div>
            <div style={{ color:C.red, marginTop:4 }}>ERROR src/arch/revision.ts:42 — Type 'string' not assignable to 'number'</div>
            <div style={{ color:"#ffd43b", marginTop:2 }}>→ Fixing: cast version field to Number()</div>
            <div style={{ color:C.green, marginTop:4 }}>✓ Build succeeded — 0 errors, 2 warnings</div>
          </div>
          <div style={{ marginTop:12 }}><Btn label="Next: Verify Architecture →" color={C.blue} primary onClick={()=>setStep(3)} /></div>
        </Step>
      )}
      {step===3 && (
        <Step n="4" title="Architecture Alignment Verification">
          <Info>OpenClaw runs <Mono>/dev-verify</Mono> — cross-checks implementation against the approved architecture plan.</Info>
          <div style={{ marginTop:10 }}>
            {[{ok:true,label:"Branch naming matches architecture spec"},{ok:true,label:"API endpoints match architecture contract"},{ok:true,label:"Database schema matches data model"},{ok:false,label:"File upload size guard implemented (5MB)"},{ok:true,label:"Revision versioning logic present"}].map((c,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7 }}>
                <span style={{ fontSize:13, color:c.ok?C.green:C.red }}>{c.ok?"✓":"✗"}</span>
                <span style={{ fontSize:12, color:c.ok?C.muted:"#ff8787" }}>{c.label}</span>
              </div>
            ))}
          </div>
          <Note>1 deviation — OpenClaw auto-fixes and re-verifies.</Note>
          <div style={{ marginTop:12 }}><Btn label="Next: Push & Summary →" color={C.blue} primary onClick={()=>setStep(4)} /></div>
        </Step>
      )}
      {step===4 && (
        <Step n="5" title="Push & Development Summary">
          <Info>All changes pushed to <Mono>feature/arch-lifecycle-tool</Mono>. OpenClaw runs <Mono>/dev-summarize</Mono> to generate a structured change report.</Info>
          <Card>
            <div style={{ fontSize:12, fontWeight:700, color:C.lavender, marginBottom:10 }}>Development Summary</div>
            {[["Files modified","22"],["Files created","5"],["Commits","7"],["Compile errors fixed","3"],["Arch deviations resolved","1"]].map(([k,v])=>(
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:`1px solid rgba(255,255,255,0.04)`, fontSize:12 }}>
                <span style={{ color:C.muted }}>{k}</span><span style={{ color:C.text, fontWeight:600 }}>{v}</span>
              </div>
            ))}
          </Card>
          <CommentBox placeholder="Developer comments or change requests…" />
          <div style={{ display:"flex", gap:10, marginTop:10 }}>
            <Btn label="↺  Request Changes" color={C.orange} />
            <Btn label="✓  Approve → Code Review" color={C.green} primary />
          </div>
        </Step>
      )}
      <Step n="●" title="UI Layout Spec">
        <SpecTable rows={[["Top area","5-step progress tracker (clickable)"],["Center","Active step content (diff view, compile log, verify checks, summary)"],["Right panel","Architecture plan snippet for reference"],["Bottom strip","Branch status, commit count, last push time"]]} />
      </Step>
    </div>
  );
}

// ── Code Review ───────────────────────────────────────────────────────────────
function CodeReviewPanel() {
  const [rev, setRev] = useState(0);
  const [activeFile, setActiveFile] = useState(0);
  const [expanded, setExpanded] = useState(null);
  const revStats = [
    { v:"v1", date:"2026-03-29", total:8, critical:2, status:"Pending Resolution" },
    { v:"v2", date:"2026-03-30", total:2, critical:0, status:"Pending Approval" },
  ];
  const files = ["revision.ts","runner.ts","feature.ts","guard.ts"];
  const allFindings = [
    { id:"CR-01", sev:"critical", file:"revision.ts", line:42, cat:"Security", title:"No input validation on revision payload", fix:"Add Zod schema validation before persisting." },
    { id:"CR-02", sev:"critical", file:"feature.ts", line:118, cat:"Reliability", title:"Unhandled Promise rejection in phase transition", fix:"Wrap async call in try/catch and emit error event to client." },
    { id:"CR-03", sev:"warning", file:"runner.ts", line:67, cat:"Maintainability", title:"Magic number for compile timeout (30000ms)", fix:"Extract to CONFIG.COMPILE_TIMEOUT_MS constant." },
    { id:"CR-04", sev:"warning", file:"guard.ts", line:23, cat:"Maintainability", title:"Hard-coded 5242880 for file size limit", fix:"Use named constant MAX_UPLOAD_BYTES from config." },
    { id:"CR-05", sev:"info", file:"revision.ts", line:89, cat:"Documentation", title:"Missing JSDoc on public generatePlan()", fix:"Add @param and @returns to all exported functions." },
    { id:"CR-06", sev:"info", file:"runner.ts", line:12, cat:"Code Quality", title:"Unused import: logger", fix:"Remove unused import to keep bundle clean." },
    { id:"CR-07", sev:"warning", file:"feature.ts", line:55, cat:"Performance", title:"N+1 query in feature list endpoint", fix:"Use a JOIN or batch fetch to avoid per-row DB calls." },
    { id:"CR-08", sev:"info", file:"guard.ts", line:41, cat:"Observability", title:"No logging on rejected uploads", fix:"Add structured log entry when upload is rejected." },
  ];
  const v2Findings = allFindings.slice(0,2).map(f=>({ ...f, sev:"info", title:f.title+" — ✓ resolved" }));
  const findings = rev===0 ? allFindings : v2Findings;
  const sc = { critical:C.red, warning:"#ffd43b", info:C.blue };
  const sb = { critical:C.red+"0e", warning:"#ffd43b0a", info:C.blue+"0a" };
  const allResolved = rev===1;
  return (
    <div>
      <PhaseHeader icon="⊛" title="Code Review Phase" subtitle="OpenClaw analyzes branch diff → AI findings with severity → Fix loop → Reviewer approves → Auto PR created" color={C.red} />
      <Step n="1" title="Trigger AI Review">
        <Info>OpenClaw runs <Mono>/review-analyze</Mono> on the feature branch diff vs base. Cross-checks approved architecture plan, security patterns, performance, code quality, and documentation standards.</Info>
        <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginTop:10 }}>
          {[["Architecture Compliance",C.purple],["Security Patterns",C.red],["Performance",C.orange],["Code Quality",C.green],["Documentation",C.blue],["Test Coverage",C.lavender]].map(([l,c])=>(
            <Tag key={l} color={c}>{l}</Tag>
          ))}
        </div>
        <Note>Review lenses are configurable per project in settings.</Note>
      </Step>
      <Step n="2" title="Review Findings — Revisions">
        <div style={{ display:"flex", gap:7, marginBottom:12 }}>
          {revStats.map((r,i)=><RevTab key={i} version={r.v} active={rev===i} onClick={()=>setRev(i)} />)}
        </div>
        <div style={{ display:"flex", gap:8, marginBottom:12 }}>
          {[["Findings",revStats[rev].total,C.muted],["Critical",revStats[rev].critical,C.red],["Status",revStats[rev].status,C.orange]].map(([l,v,c])=>(
            <div key={l} style={{ flex:1, background:C.card, border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 12px" }}>
              <Lbl>{l}</Lbl>
              <div style={{ fontSize:15, fontWeight:700, color:c }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <div style={{ width:130, flexShrink:0 }}>
            <Lbl>Files Reviewed</Lbl>
            {files.map((f,i)=>(
              <button key={i} onClick={()=>setActiveFile(i)} style={{ width:"100%", textAlign:"left", padding:"6px 9px", borderRadius:6, background:activeFile===i?C.purple+"18":"transparent", border:`1px solid ${activeFile===i?C.purple+"40":"transparent"}`, color:activeFile===i?C.lavender:C.dim, fontSize:10, fontFamily:"monospace", cursor:"pointer", marginBottom:3, display:"block" }}>{f}</button>
            ))}
          </div>
          <div style={{ flex:1 }}>
            <Lbl>Findings {rev===1?"— After Fixes":""}</Lbl>
            {findings.map((f,i)=>(
              <div key={f.id} onClick={()=>setExpanded(expanded===i?null:i)} style={{ background:sb[f.sev], borderLeft:`3px solid ${sc[f.sev]}`, border:`1px solid ${sc[f.sev]}25`, borderRadius:7, padding:"8px 11px", marginBottom:6, cursor:"pointer" }}>
                <div style={{ display:"flex", alignItems:"center", gap:7, flexWrap:"wrap" }}>
                  <span style={{ fontSize:9, fontWeight:700, color:sc[f.sev], background:sc[f.sev]+"20", padding:"2px 7px", borderRadius:10, textTransform:"uppercase" }}>{f.sev}</span>
                  <Mono>{f.id}</Mono>
                  <span style={{ fontSize:11, color:C.text, flex:1 }}>{f.title}</span>
                  <span style={{ fontSize:9, color:C.dim }}>{f.cat}</span>
                  <span style={{ fontSize:9, color:C.dim }}>{expanded===i?"▲":"▼"}</span>
                </div>
                {expanded===i && (
                  <div style={{ marginTop:7, paddingTop:7, borderTop:`1px solid ${C.border}` }}>
                    <div style={{ fontSize:10, color:C.dim, marginBottom:3 }}><Mono>{f.file}</Mono> line {f.line}</div>
                    <div style={{ fontSize:11, color:C.muted, lineHeight:1.6 }}>💡 {f.fix}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Step>
      <Step n="3" title="Auto-Fix Loop">
        <Info>For each critical/warning finding, OpenClaw runs <Mono>/review-fix [id]</Mono>. It applies the fix, re-compiles, and re-checks only the affected finding. Once all criticals are resolved the revision auto-increments to v2.</Info>
        <div style={{ marginTop:10 }}>
          {[{id:"CR-01",label:"Add Zod validation on revision payload"},{id:"CR-02",label:"Wrap phase transition in try/catch"},{id:"CR-03",label:"Extract compile timeout to config constant"},{id:"CR-04",label:"Replace magic number with MAX_UPLOAD_BYTES"}].map(item=>(
            <div key={item.id} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7, padding:"8px 11px", borderRadius:7, background:allResolved?C.green+"08":C.card, border:`1px solid ${allResolved?C.green+"25":C.border}` }}>
              <span style={{ fontSize:12, color:allResolved?C.green:C.dim }}>{allResolved?"✓":"○"}</span>
              <span style={{ fontSize:11, color:allResolved?C.green:C.muted, flex:1 }}><Mono>{item.id}</Mono>{"  "}{item.label}</span>
              {!allResolved && <button onClick={()=>setRev(1)} style={{ background:C.purple+"15", border:`1px solid ${C.purple}35`, color:C.lavender, padding:"3px 9px", borderRadius:5, fontSize:10, cursor:"pointer" }}>Auto-fix</button>}
            </div>
          ))}
        </div>
        <Note>Manual override — mark a finding as "Won't Fix" with justification.</Note>
      </Step>
      <Step n="4" title="Reviewer Decision">
        <CommentBox placeholder="Reviewer comments, additional concerns, or override justifications…" />
        {!allResolved && <p style={{ color:C.red, fontSize:11, marginTop:6 }}>⚠ {revStats[rev].critical} critical finding(s) unresolved — resolve all before approving.</p>}
        <div style={{ display:"flex", gap:10, marginTop:10 }}>
          <Btn label="↺  Request Another Pass" color={C.orange} />
          <Btn label="✓  Approve & Create PR → Testing" color={C.green} primary disabled={!allResolved} />
        </div>
      </Step>
      <Step n="5" title="Auto PR Creation (on Approval)">
        <Info>On approval, OpenClaw runs <Mono>/review-pr</Mono> to create the Pull Request. PR description is auto-generated from development summary + review findings + resolution notes.</Info>
        <Card>
          <div style={{ fontSize:11, color:C.lavender, fontWeight:700, marginBottom:10 }}>PR Preview</div>
          <div style={{ display:"flex", gap:10 }}>
            <div style={{ flex:2 }}><Lbl>Title</Lbl><div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:6, padding:"7px 10px", fontSize:11, color:C.muted, fontFamily:"monospace" }}>feat: arch-lifecycle-tool</div></div>
            <div style={{ flex:1 }}><Lbl>Target</Lbl><div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:6, padding:"7px 10px", fontSize:11, color:C.muted, fontFamily:"monospace" }}>main</div></div>
          </div>
          <div style={{ marginTop:8, padding:"9px 11px", background:"rgba(255,255,255,0.02)", borderRadius:6, fontSize:10, color:C.dim }}>Auto-includes: feature summary · architecture decisions · review findings & resolutions · test plan link</div>
        </Card>
      </Step>
      <Step n="●" title="UI Layout Spec">
        <SpecTable rows={[
          ["Top area","Review revision tabs (v1, v2) + stats bar (total / critical / status)"],
          ["Left panel","File list — click to filter findings by file"],
          ["Center panel","Findings — severity badge, file:line, category, expandable AI suggestion"],
          ["Fix strip","Per-finding auto-fix button or Won't Fix toggle"],
          ["Bottom","Reviewer comment box + Request Pass / Approve & Create PR"],
        ]} />
      </Step>
    </div>
  );
}

// ── Testing ───────────────────────────────────────────────────────────────────
function TestingPanel() {
  const [rev, setRev] = useState(0);
  const revs = [
    { v:"v1", date:"2026-03-30", cases:14, coverage:"72%" },
    { v:"v2", date:"2026-03-31", cases:19, coverage:"89%" },
  ];
  const cases = [
    { id:"TC-01", name:"Upload valid requirement document", type:"Integration" },
    { id:"TC-02", name:"Reject file > 5MB", type:"Unit" },
    { id:"TC-03", name:"Generate architecture plan revision v1", type:"E2E" },
    { id:"TC-04", name:"Approve revision transitions phase status", type:"Integration" },
    { id:"TC-05", name:"Git branch created and pushed on dev start", type:"Integration" },
    { id:"TC-06", name:"AI question blocks Approve when unanswered", type:"Unit" },
    { id:"TC-07", name:"Critical review finding blocks PR creation", type:"Unit" },
  ];
  return (
    <div>
      <PhaseHeader icon="✓" title="Testing Phase" subtitle="AI generates test plan from req + architecture → revisions → developer feedback → approve → write tests" color={C.green} />
      <Step n="1" title="Test Case Plan — Revisions">
        <p style={{ fontSize:12, color:C.muted, marginBottom:10 }}>OpenClaw runs <Mono>/test-plan</Mono> using the requirement document and approved architecture plan as context. Same revision model as Architecture phase.</p>
        <div style={{ display:"flex", gap:7, marginBottom:12 }}>
          {revs.map((r,i)=><RevTab key={i} version={r.v} active={rev===i} onClick={()=>setRev(i)} />)}
        </div>
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <span style={{ color:C.green, fontWeight:700 }}>Test Plan — Revision {revs[rev].v}</span>
            <span style={{ fontSize:11, color:C.dim }}>{revs[rev].date}</span>
          </div>
          <div style={{ display:"flex", gap:10, marginBottom:12 }}>
            {[["Test Cases",revs[rev].cases,C.purple],["Est. Coverage",revs[rev].coverage,C.green]].map(([l,v,c])=>(
              <div key={l} style={{ flex:1, textAlign:"center" }}>
                <div style={{ fontSize:20, fontWeight:700, color:c }}>{v}</div>
                <div style={{ fontSize:10, color:C.dim, marginTop:2 }}>{l}</div>
              </div>
            ))}
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
            <thead><tr>{["ID","Test Case","Type","Status"].map(h=><th key={h} style={{ textAlign:"left", color:C.green, padding:"5px 8px", borderBottom:`1px solid ${C.green}20` }}>{h}</th>)}</tr></thead>
            <tbody>{cases.map(c=>(
              <tr key={c.id}>
                <td style={{ padding:"5px 8px", color:C.blue, fontFamily:"monospace", fontSize:10 }}>{c.id}</td>
                <td style={{ padding:"5px 8px", color:C.muted }}>{c.name}</td>
                <td style={{ padding:"5px 8px", color:C.dim }}>{c.type}</td>
                <td style={{ padding:"5px 8px" }}><Tag color={C.orange}>planned</Tag></td>
              </tr>
            ))}</tbody>
          </table>
        </Card>
      </Step>
      <Step n="2" title="Developer Feedback">
        <CommentBox placeholder="Add feedback: missing scenarios, edge cases, priority changes…" />
        <div style={{ display:"flex", gap:10, marginTop:10 }}>
          <Btn label="↺  Request Revision" color={C.orange} />
          <Btn label="✓  Approve Test Plan" color={C.green} primary />
        </div>
      </Step>
      <Step n="3" title="Write Module Tests (Post-Approval)">
        <Info>After plan approval, OpenClaw runs <Mono>/test-implement</Mono> to generate actual test files matching each approved test case. Tests are committed to the feature branch.</Info>
        <ProgressBar label="Writing tests… 11 / 19 test cases written" pct={57} color={C.green} />
      </Step>
      <Step n="●" title="UI Layout Spec">
        <SpecTable rows={[
          ["Top area","Test plan revision tabs + stats (case count, coverage estimate)"],
          ["Center panel","Test case list with ID, name, type, status badge"],
          ["Right panel","Architecture + requirement snippets for reference"],
          ["Bottom","Developer comment box + Request Revision / Approve actions"],
        ]} />
      </Step>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
const PHASES = [
  { id:"overview", label:"Overview", icon:"◈", color:C.purple },
  { id:"architecture", label:"Architecture", icon:"⬡", color:C.purple },
  { id:"development", label:"Development", icon:"⟨/⟩", color:C.blue },
  { id:"codereview", label:"Code Review", icon:"⊛", color:C.red },
  { id:"testing", label:"Testing", icon:"✓", color:C.green },
];
const STATUS = { overview:"active", architecture:"active", development:"pending", codereview:"pending", testing:"pending" };
const SCOL = { active:C.purple, done:C.green, pending:C.dim, blocked:C.red };

export default function App() {
  const [active, setActive] = useState("overview");
  const panels = { overview:<OverviewPanel/>, architecture:<ArchitecturePanel/>, development:<DevelopmentPanel/>, codereview:<CodeReviewPanel/>, testing:<TestingPanel/> };
  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'DM Sans','Segoe UI',sans-serif", display:"flex", flexDirection:"column" }}>
      <div style={{ borderBottom:`1px solid ${C.border}`, padding:"12px 22px", display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(255,255,255,0.01)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:26, height:26, background:"linear-gradient(135deg,#7c6fff,#54a0ff)", borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>⚙</div>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:C.text }}>OpenClaw Feature Lifecycle</div>
            <div style={{ fontSize:10, color:C.dim }}>AI-Powered SDLC Tool</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:11, color:C.muted }}>Project:</span>
          <span style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:6, padding:"3px 10px", fontSize:11, color:C.muted, fontFamily:"monospace" }}>laundry-management-app</span>
        </div>
      </div>
      <div style={{ display:"flex", flex:1 }}>
        <div style={{ width:185, borderRight:`1px solid ${C.border}`, padding:"18px 10px", flexShrink:0 }}>
          <Lbl>Phases</Lbl>
          {PHASES.map(p=>{
            const isActive=active===p.id;
            return (
              <button key={p.id} onClick={()=>setActive(p.id)} style={{ width:"100%", display:"flex", alignItems:"center", gap:9, padding:"8px 10px", borderRadius:8, border:"none", background:isActive?p.color+"18":"transparent", cursor:"pointer", textAlign:"left", marginBottom:2 }}>
                <span style={{ fontSize:13, color:isActive?p.color:C.dim }}>{p.icon}</span>
                <span style={{ fontSize:12, fontWeight:isActive?700:400, color:isActive?C.text:C.dim, flex:1 }}>{p.label}</span>
                <div style={{ width:6, height:6, borderRadius:"50%", background:SCOL[STATUS[p.id]] }} />
              </button>
            );
          })}
          <div style={{ marginTop:20, borderTop:`1px solid ${C.border}`, paddingTop:14 }}>
            <Lbl>Legend</Lbl>
            {[["active","In Progress"],["done","Done"],["pending","Not Started"]].map(([k,v])=>(
              <div key={k} style={{ display:"flex", alignItems:"center", gap:7, marginBottom:6, paddingLeft:6 }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:SCOL[k] }} />
                <span style={{ fontSize:10, color:C.dim }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex:1, padding:"24px 28px", overflowY:"auto", maxWidth:860 }}>
          {panels[active]}
        </div>
      </div>
    </div>
  );
}
