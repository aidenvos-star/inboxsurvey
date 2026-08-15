<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>InboxSurvey — How it works</title>
<style>

/* =========================================================================
   TOKENS — the whole visual identity lives here. Swap these to re-theme.
   ========================================================================= */
:root{
  --bg:#080b09;
  --surface:#111712;
  --surface-border: rgba(220,255,220,0.09);
  --lime:#b7ff69;
  --mint:#58e5a1;
  --text-primary:#f7faf6;
  --text-secondary:#9ba69d;
  --text-muted:#68736b;
  --glow: rgba(183,255,105,0.12);
  --font: 'Inter', ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}

*{ box-sizing:border-box; }

html,body{
  margin:0;
  padding:0;
  background:var(--bg);
  color:var(--text-primary);
  font-family:var(--font);
  font-weight:400;
  -webkit-font-smoothing:antialiased;
}

body{
  min-height:100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:56px 20px;
  background:
    radial-gradient(60% 50% at 50% 8%, rgba(183,255,105,0.05), transparent 70%),
    var(--bg);
}

.page{
  width:100%;
  max-width:980px;
}

/* ---- header / framing text ---- */
.eyebrow{
  font-size:12px;
  letter-spacing:0.14em;
  text-transform:uppercase;
  color:var(--mint);
  font-weight:500;
  margin:0 0 10px;
  text-align:center;
}
h1{
  font-size:clamp(22px,3vw,30px);
  font-weight:500;
  letter-spacing:-0.01em;
  text-align:center;
  margin:0 0 8px;
  color:var(--text-primary);
}
.subhead{
  font-size:15px;
  color:var(--text-secondary);
  text-align:center;
  margin:0 auto 48px;
  max-width:480px;
  line-height:1.5;
}

/* =========================================================================
   ICONS — one shared sprite sheet, reused everywhere via <use>.
   ========================================================================= */
.icon-sprite{ display:none; }
.icon{
  width:100%;
  height:100%;
  fill:none;
  stroke:currentColor;
  stroke-width:1.6;
  stroke-linecap:round;
  stroke-linejoin:round;
}

/* =========================================================================
   DESKTOP DIAGRAM — absolutely-positioned HTML cards over an SVG line layer.
   Every coordinate below is expressed on the SAME 0–140 x / 0–100 y grid
   used by the SVG viewBox, so the lines and the cards always line up.
   ========================================================================= */
.diagram-shell{
  position:relative;
}

.diagram-desktop{
  position:relative;
  width:100%;
  aspect-ratio: 7 / 5;
  max-width:920px;
  margin:0 auto;
}

.lines-layer{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  overflow:visible;
}

.spoke{
  fill:none;
  stroke:var(--surface-border);
  stroke-width:0.35;
  vector-effect:non-scaling-stroke;
  stroke-dasharray:100;
  stroke-dashoffset:100;
  animation:draw-line 1.2s cubic-bezier(.4,0,.2,1) forwards;
}
.spoke.s-gmail{ animation-delay:.05s; }
.spoke.s-ai{ animation-delay:.15s; }
.spoke.s-email{ animation-delay:.25s; }
.spoke.s-storage{ animation-delay:.35s; }
.spoke.s-results{ animation-delay:.45s; }

@keyframes draw-line{
  to{ stroke-dashoffset:0; }
}

.shield-ring{
  fill:none;
  stroke:var(--lime);
  stroke-width:0.4;
  vector-effect:non-scaling-stroke;
  opacity:0.16;
  transition:opacity .5s ease, stroke-width .5s ease;
}
.shield-ring.flash{
  opacity:0.9;
  stroke-width:0.9;
}

.particle{ fill:var(--lime); opacity:0.85; }
.particle.p2{ fill:var(--mint); opacity:0.7; }
.particle.p3{ opacity:0.55; }

@media (prefers-reduced-motion: reduce){
  .particle{ display:none; }
}

/* ---- node cards (desktop) ---- */
.node{
  position:absolute;
  transform:translate(-50%,-50%) scale(.92);
  width:clamp(118px,15vw,168px);
  padding:14px 14px 13px;
  background:rgba(17,23,18,0.72);
  backdrop-filter:blur(14px);
  -webkit-backdrop-filter:blur(14px);
  border:1px solid var(--surface-border);
  border-radius:14px;
  text-align:left;
  cursor:pointer;
  color:inherit;
  font-family:inherit;
  opacity:0;
  animation:node-in .7s cubic-bezier(.16,1,.3,1) forwards;
  transition:transform .25s ease, border-color .25s ease, box-shadow .25s ease;
}
@keyframes node-in{
  from{ opacity:0; transform:translate(-50%,-50%) scale(.88); }
  to{ opacity:1; transform:translate(-50%,-50%) scale(1); }
}
.node:hover,
.node:focus-visible,
.node.open{
  transform:translate(-50%,-50%) scale(1.05);
  border-color:rgba(183,255,105,0.35);
  box-shadow:0 0 0 1px rgba(183,255,105,0.08), 0 12px 32px -8px var(--glow);
  outline:none;
  z-index:5;
}
.node.active{
  border-color:rgba(183,255,105,0.55);
  box-shadow:0 0 0 1px rgba(183,255,105,0.15), 0 0 40px -6px var(--glow);
}
.node.processing{
  border-color:rgba(88,229,161,0.6);
  box-shadow:0 0 0 1px rgba(88,229,161,0.18), 0 0 40px -6px rgba(88,229,161,0.22);
}

.node .node-icon{
  width:20px;
  height:20px;
  color:var(--lime);
  margin-bottom:9px;
}
.node.processing .node-icon{ color:var(--mint); }

.node-label{
  font-size:14px;
  font-weight:500;
  color:var(--text-primary);
  margin:0 0 3px;
  letter-spacing:-0.005em;
}
.node-sub{
  font-size:11.5px;
  color:var(--text-muted);
  margin:0;
  letter-spacing:0.01em;
}

/* ---- tooltip ---- */
.tooltip{
  position:absolute;
  left:50%;
  bottom:calc(100% + 10px);
  transform:translate(-50%,4px);
  width:230px;
  padding:12px 14px;
  background:rgba(17,23,18,0.85);
  backdrop-filter:blur(18px);
  -webkit-backdrop-filter:blur(18px);
  border:1px solid var(--surface-border);
  border-radius:12px;
  font-size:12.5px;
  line-height:1.5;
  color:var(--text-secondary);
  opacity:0;
  visibility:hidden;
  pointer-events:none;
  transition:opacity .18s ease, transform .18s ease;
  z-index:20;
  box-shadow:0 20px 40px -12px rgba(0,0,0,0.6);
}
.node:hover .tooltip,
.node:focus-visible .tooltip,
.node.open .tooltip{
  opacity:1;
  visibility:visible;
  transform:translate(-50%,0);
  pointer-events:auto;
}
.node:hover .tooltip{ border-color:rgba(183,255,105,0.25); }

/* Flip tooltip below the card for the top row so it doesn't run off-screen */
.node[data-row="top"] .tooltip{
  bottom:auto;
  top:calc(100% + 10px);
  transform:translate(-50%,-4px);
}
.node[data-row="top"]:hover .tooltip,
.node[data-row="top"]:focus-visible .tooltip,
.node[data-row="top"].open .tooltip{
  transform:translate(-50%,0);
}

/* ---- results sample + badge (desktop) ---- */
.result-sample{
  margin-top:9px;
  padding-top:9px;
  border-top:1px solid var(--surface-border);
  font-size:11.5px;
  color:var(--text-secondary);
  display:none;
}
.result-sample.show{ display:block; animation:fade-up .35s ease forwards; }
.result-sample .rs-name{ color:var(--text-primary); font-weight:500; }

@keyframes fade-up{
  from{ opacity:0; transform:translateY(4px); }
  to{ opacity:1; transform:translateY(0); }
}

.badge{
  position:absolute;
  top:-11px;
  right:-10px;
  background:var(--lime);
  color:#0a1207;
  font-size:11px;
  font-weight:500;
  padding:5px 10px;
  border-radius:100px;
  opacity:0;
  transform:scale(.3);
  white-space:nowrap;
  box-shadow:0 6px 18px -4px rgba(183,255,105,0.5);
}
.badge.show{ animation:spring-in .55s cubic-bezier(.34,1.56,.64,1) forwards; }
@keyframes spring-in{
  0%{ opacity:0; transform:scale(.3); }
  60%{ opacity:1; transform:scale(1.15); }
  100%{ opacity:1; transform:scale(1); }
}

/* ---- center hub ---- */
.hub{
  position:absolute;
  left:50%;
  top:46%;
  width:clamp(68px,9vw,96px);
  height:clamp(68px,9vw,96px);
  transform:translate(-50%,-50%);
  z-index:10;
}
.hub-core{
  position:absolute;
  inset:0;
  border-radius:50%;
  background:
    radial-gradient(circle at 35% 30%, rgba(183,255,105,0.16), transparent 60%),
    rgba(17,23,18,0.85);
  border:1px solid rgba(183,255,105,0.22);
  backdrop-filter:blur(10px);
  -webkit-backdrop-filter:blur(10px);
  display:flex;
  align-items:center;
  justify-content:center;
  box-shadow:0 0 40px -6px var(--glow);
  transition:box-shadow .4s ease, border-color .4s ease;
}
.hub.active .hub-core{
  box-shadow:0 0 60px -4px rgba(183,255,105,0.35);
  border-color:rgba(183,255,105,0.5);
}
.hub-core svg{
  width:38%;
  height:38%;
  color:var(--lime);
}
.hub-ring{
  position:absolute;
  inset:0;
  border-radius:50%;
  border:1px solid var(--lime);
  opacity:0;
  animation:ring-pulse 3s ease-out infinite;
}
.hub-ring:nth-child(2){ animation-delay:1s; }
.hub-ring:nth-child(3){ animation-delay:2s; }
@keyframes ring-pulse{
  0%{ transform:scale(1); opacity:.45; }
  100%{ transform:scale(1.9); opacity:0; }
}
.hub.pulse-once .hub-core{ animation:hub-pulse-once .9s ease; }
@keyframes hub-pulse-once{
  0%{ box-shadow:0 0 40px -6px var(--glow); }
  40%{ box-shadow:0 0 80px 0px rgba(183,255,105,0.5); }
  100%{ box-shadow:0 0 40px -6px var(--glow); }
}

@media (prefers-reduced-motion: reduce){
  .hub-ring{ animation:none; opacity:0; }
  .node{ animation-duration:.01s; }
  .spoke{ animation-duration:.01s; }
}

/* =========================================================================
   CONTROLS — play button + step caption
   ========================================================================= */
.controls{
  margin-top:40px;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:16px;
}
.play-btn{
  font-family:inherit;
  font-size:13.5px;
  font-weight:500;
  color:#0a1207;
  background:var(--lime);
  border:none;
  padding:12px 26px;
  border-radius:100px;
  cursor:pointer;
  letter-spacing:0.01em;
  transition:transform .15s ease, box-shadow .15s ease, opacity .15s ease;
  box-shadow:0 8px 24px -8px rgba(183,255,105,0.5);
}
.play-btn:hover:not(:disabled){ transform:translateY(-1px); box-shadow:0 12px 28px -8px rgba(183,255,105,0.6); }
.play-btn:disabled{ opacity:0.55; cursor:default; transform:none; }

.step-label{
  min-height:18px;
  font-size:13px;
  color:var(--text-secondary);
  text-align:center;
  max-width:420px;
  transition:opacity .2s ease;
}

/* =========================================================================
   MOBILE STACK — swapped in below 600px. Same data-node hooks, so the
   play() logic in JS drives both layouts without knowing which is visible.
   ========================================================================= */
.diagram-mobile{ display:none; }

@media (max-width:600px){
  .diagram-desktop{ display:none; }
  .diagram-mobile{ display:block; }

  body{ padding:40px 16px; }
  .subhead{ margin-bottom:34px; }

  .diagram-mobile{
    position:relative;
    padding-left:26px;
  }
  .diagram-mobile::before{
    content:"";
    position:absolute;
    left:9px;
    top:8px;
    bottom:8px;
    width:1px;
    background:linear-gradient(var(--surface-border), var(--surface-border));
  }

  .m-hub{
    position:relative;
    display:flex;
    align-items:center;
    gap:12px;
    margin-bottom:18px;
  }
  .m-hub::before{
    content:"";
    position:absolute;
    left:-26px;
    top:50%;
    width:18px;
    height:1px;
    background:var(--surface-border);
  }
  .m-hub-dot{
    width:34px;
    height:34px;
    border-radius:50%;
    background:rgba(17,23,18,0.9);
    border:1px solid rgba(183,255,105,0.3);
    display:flex;
    align-items:center;
    justify-content:center;
    flex-shrink:0;
    transition:box-shadow .4s ease;
  }
  .m-hub-dot svg{ width:16px; height:16px; color:var(--lime); }
  .m-hub.active .m-hub-dot{ box-shadow:0 0 24px -2px var(--glow); }
  .m-hub-label{ font-size:13px; font-weight:500; color:var(--text-primary); }
  .m-hub-sub{ font-size:11px; color:var(--text-muted); margin-top:1px; }

  .node{
    position:relative;
    left:auto; top:auto;
    transform:none;
    width:100%;
    margin-bottom:12px;
    opacity:1;
    animation:none;
  }
  .node::before{
    content:"";
    position:absolute;
    left:-26px;
    top:26px;
    width:18px;
    height:1px;
    background:var(--surface-border);
  }
  .node:hover,
  .node:focus-visible,
  .node.open{ transform:none; }

  .tooltip{
    position:static;
    width:auto;
    opacity:1;
    visibility:visible;
    pointer-events:none;
    transform:none;
    display:none;
    margin-top:10px;
    box-shadow:none;
  }
  .node.open .tooltip{ display:block; }
  .node[data-row="top"] .tooltip{ top:auto; }

  .badge{ top:-9px; right:6px; }
}

/* =========================================================================
   FOOTER NOTE
   ========================================================================= */
.footnote{
  margin-top:44px;
  text-align:center;
  font-size:12px;
  color:var(--text-muted);
}
.footnote button{
  font:inherit;
  color:var(--mint);
  background:none;
  border:none;
  padding:0;
  cursor:pointer;
  text-decoration:underline;
  text-underline-offset:2px;
}

</style>
</head>
<body>

<!-- Shared icon sprite. Every icon used anywhere in the diagram lives here once. -->
<svg class="icon-sprite" aria-hidden="true">
  <symbol id="i-monitor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></symbol>
  <symbol id="i-mail" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></symbol>
  <symbol id="i-ai" viewBox="0 0 24 24"><circle cx="12" cy="12" r="2.3"/><circle cx="5" cy="5" r="1.5"/><circle cx="19" cy="5" r="1.5"/><circle cx="5" cy="19" r="1.5"/><circle cx="19" cy="19" r="1.5"/><path d="M9.9 10.1L6.2 6.4M14.1 10.1l3.7-3.7M9.9 13.9l-3.7 3.7M14.1 13.9l3.7 3.7"/></symbol>
  <symbol id="i-folder" viewBox="0 0 24 24"><path d="M3 7a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/></symbol>
  <symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 3l7 3v6c0 5-3 8-7 9-4-1-7-4-7-9V6z"/><path d="M8.5 12.2l2.4 2.4 4.6-4.8"/></symbol>
  <symbol id="i-check" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8 12.3l2.6 2.6L16.3 9"/></symbol>
</svg>

<div class="page">

  <p class="eyebrow">Architecture</p>
  <h1>How InboxSurvey works</h1>
  <p class="subhead">Your emails go into your browser, a local model reads them there, and you see results immediately — nothing is saved anywhere.</p>

  <div class="diagram-shell">

    <!-- ===================================================================
         DESKTOP / TABLET DIAGRAM
         Coordinate system: SVG viewBox is 0–140 (x) by 0–100 (y). HTML
         cards are positioned with matching left/top percentages so lines
         and cards always align, at any screen size.
         =================================================================== -->
    <div class="diagram-desktop">

      <svg class="lines-layer" viewBox="0 0 140 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <!-- hidden compound path the ambient particles ride along:
             Gmail -> Center -> AI -> Center -> Results -->
        <path id="flow-path" d="M70,8 L70,46 L114,30 L70,46 L26,30" fill="none" stroke="none"/>

        <!-- static spokes, hub to each node -->
        <path class="spoke s-gmail"   pathLength="100" d="M70,46 L70,8"/>
        <path class="spoke s-ai"      pathLength="100" d="M70,46 L114,30"/>
        <path class="spoke s-email"   pathLength="100" d="M70,46 L100,78"/>
        <path class="spoke s-storage" pathLength="100" d="M70,46 L40,78"/>
        <path class="spoke s-results" pathLength="100" d="M70,46 L26,30"/>

        <!-- security ring: flashes when data "enters" the browser -->
        <circle id="shield-ring" class="shield-ring" cx="70" cy="46" r="11"/>

        <!-- ambient data-flow particles, each at a different speed -->
        <circle class="particle p1" r="0.9">
          <animateMotion dur="5s" repeatCount="indefinite" begin="0s"><mpath xlink:href="#flow-path" href="#flow-path"/></animateMotion>
        </circle>
        <circle class="particle p2" r="0.8">
          <animateMotion dur="6.5s" repeatCount="indefinite" begin="1.3s"><mpath xlink:href="#flow-path" href="#flow-path"/></animateMotion>
        </circle>
        <circle class="particle p3" r="0.7">
          <animateMotion dur="8s" repeatCount="indefinite" begin="3.1s"><mpath xlink:href="#flow-path" href="#flow-path"/></animateMotion>
        </circle>
      </svg>

      <!-- center hub -->
      <div class="hub" id="hub" data-node="hub">
        <div class="hub-ring"></div>
        <div class="hub-ring"></div>
        <div class="hub-ring"></div>
        <div class="hub-core"><svg class="icon"><use href="#i-monitor"/></svg></div>
      </div>

      <!-- Gmail API — top -->
      <button class="node" type="button" data-node="gmail" data-row="top" style="left:50%; top:8%; animation-delay:.35s;" aria-describedby="tt-gmail">
        <svg class="node-icon icon"><use href="#i-mail"/></svg>
        <p class="node-label">Gmail API</p>
        <p class="node-sub">OAuth 2.0 · read-only</p>
        <div class="tooltip" id="tt-gmail" role="tooltip">Requests only the gmail.readonly scope. Cannot send, delete, or modify anything in your account.</div>
      </button>

      <!-- Local AI — top right -->
      <button class="node" type="button" data-node="ai" style="left:81.4%; top:30%; animation-delay:.45s;" aria-describedby="tt-ai">
        <svg class="node-icon icon"><use href="#i-ai"/></svg>
        <p class="node-label">Local AI</p>
        <p class="node-sub">Llama 3.2 1B · WebGPU</p>
        <div class="tooltip" id="tt-ai" role="tooltip">Downloads roughly 300MB once, then runs entirely on your GPU via WebGPU. No server ever sees your emails.</div>
      </button>

      <!-- Every Email — bottom right -->
      <button class="node" type="button" data-node="email" style="left:71.4%; top:78%; animation-delay:.55s;" aria-describedby="tt-email">
        <svg class="node-icon icon"><use href="#i-folder"/></svg>
        <p class="node-label">Every Email</p>
        <p class="node-sub">in:anywhere · all pages</p>
        <div class="tooltip" id="tt-email" role="tooltip">Searches with in:anywhere across inbox, archive, spam, and trash, paging through every result.</div>
      </button>

      <!-- Zero Storage — bottom left -->
      <button class="node" type="button" data-node="storage" style="left:28.6%; top:78%; animation-delay:.65s;" aria-describedby="tt-storage">
        <svg class="node-icon icon"><use href="#i-shield"/></svg>
        <p class="node-label">Zero Storage</p>
        <p class="node-sub">No server · no memory</p>
        <div class="tooltip" id="tt-storage" role="tooltip">No database, no cookies, no logs. Everything evaporates the moment you close the tab.</div>
      </button>

      <!-- Live Results — top left -->
      <button class="node" type="button" data-node="results" data-row="top" style="left:18.6%; top:30%; animation-delay:.75s;" aria-describedby="tt-results">
        <svg class="node-icon icon"><use href="#i-check"/></svg>
        <p class="node-label">Live Results</p>
        <p class="node-sub">Instant output · no batching</p>
        <div class="tooltip" id="tt-results" role="tooltip">An onFound() callback fires per email. No batching, no memory — results write to the page instantly.</div>
        <div class="result-sample" data-sample>
          <span class="rs-name">Netflix</span> · $15.49/mo — detected
        </div>
        <div class="badge" data-badge>1 service found</div>
      </button>

    </div>

    <!-- ===================================================================
         MOBILE STACK — same nodes, same data-node hooks, vertical layout.
         =================================================================== -->
    <div class="diagram-mobile" aria-hidden="false">

      <div class="m-hub" data-node="hub">
        <div class="m-hub-dot"><svg class="icon"><use href="#i-monitor"/></svg></div>
        <div>
          <div class="m-hub-label">Your Browser</div>
          <div class="m-hub-sub">Everything happens here</div>
        </div>
      </div>

      <button class="node" type="button" data-node="gmail" aria-describedby="tt-gmail-m">
        <svg class="node-icon icon"><use href="#i-mail"/></svg>
        <p class="node-label">Gmail API</p>
        <p class="node-sub">OAuth 2.0 · read-only</p>
        <div class="tooltip" id="tt-gmail-m" role="tooltip">Requests only the gmail.readonly scope. Cannot send, delete, or modify anything in your account.</div>
      </button>

      <button class="node" type="button" data-node="ai" aria-describedby="tt-ai-m">
        <svg class="node-icon icon"><use href="#i-ai"/></svg>
        <p class="node-label">Local AI</p>
        <p class="node-sub">Llama 3.2 1B · WebGPU</p>
        <div class="tooltip" id="tt-ai-m" role="tooltip">Downloads roughly 300MB once, then runs entirely on your GPU via WebGPU. No server ever sees your emails.</div>
      </button>

      <button class="node" type="button" data-node="email" aria-describedby="tt-email-m">
        <svg class="node-icon icon"><use href="#i-folder"/></svg>
        <p class="node-label">Every Email</p>
        <p class="node-sub">in:anywhere · all pages</p>
        <div class="tooltip" id="tt-email-m" role="tooltip">Searches with in:anywhere across inbox, archive, spam, and trash, paging through every result.</div>
      </button>

      <button class="node" type="button" data-node="storage" aria-describedby="tt-storage-m">
        <svg class="node-icon icon"><use href="#i-shield"/></svg>
        <p class="node-label">Zero Storage</p>
        <p class="node-sub">No server · no memory</p>
        <div class="tooltip" id="tt-storage-m" role="tooltip">No database, no cookies, no logs. Everything evaporates the moment you close the tab.</div>
      </button>

      <button class="node" type="button" data-node="results" style="margin-bottom:0;" aria-describedby="tt-results-m">
        <svg class="node-icon icon"><use href="#i-check"/></svg>
        <p class="node-label">Live Results</p>
        <p class="node-sub">Instant output · no batching</p>
        <div class="tooltip" id="tt-results-m" role="tooltip">An onFound() callback fires per email. No batching, no memory — results write to the page instantly.</div>
        <div class="result-sample" data-sample>
          <span class="rs-name">Netflix</span> · $15.49/mo — detected
        </div>
        <div class="badge" data-badge>1 service found</div>
      </button>

    </div>

  </div>

  <div class="controls">
    <button class="play-btn" id="playBtn" type="button">Play flow</button>
    <p class="step-label" id="stepLabel" aria-live="polite">See exactly what happens when InboxSurvey scans your inbox.</p>
  </div>

  <p class="footnote">Tap any node above for the technical detail behind it.</p>

</div>

<script>
/* =========================================================================
   Everything below only does three things:
   1. lets you tap/click a node to open its tooltip (for touch screens),
   2. runs the "Play flow" step-by-step story,
   3. triggers the one-time hub pulse once the page has finished loading in.
   No animation libraries — every visual effect above is plain CSS or SMIL.
   ========================================================================= */

// ---- 1. tap-to-open tooltips (hover already works via CSS) ----
document.querySelectorAll('.node').forEach(function(node){
  node.addEventListener('click', function(e){
    var isOpen = node.classList.contains('open');
    document.querySelectorAll('.node.open').forEach(function(n){ n.classList.remove('open'); });
    if (!isOpen) node.classList.add('open');
  });
});
document.addEventListener('click', function(e){
  if (!e.target.closest('.node')) {
    document.querySelectorAll('.node.open').forEach(function(n){ n.classList.remove('open'); });
  }
});

// ---- small helpers ----
function delay(ms){ return new Promise(function(res){ setTimeout(res, ms); }); }
function setActive(id, on, extraClass){
  document.querySelectorAll('[data-node="' + id + '"]').forEach(function(el){
    el.classList.toggle('active', on);
    if (extraClass) el.classList.toggle(extraClass, on);
  });
}
function setStepLabel(text){
  document.getElementById('stepLabel').textContent = text;
}
function flashShield(){
  var ring = document.getElementById('shield-ring');
  ring.classList.add('flash');
  setTimeout(function(){ ring.classList.remove('flash'); }, 500);
}
function showSample(on){
  document.querySelectorAll('[data-sample]').forEach(function(el){ el.classList.toggle('show', on); });
}
function showBadge(on){
  document.querySelectorAll('[data-badge]').forEach(function(el){ el.classList.toggle('show', on); });
}

// ---- 2. the guided "Play flow" sequence ----
var playing = false;

function resetFlow(){
  ['gmail','ai','email','storage','results','hub'].forEach(function(id){ setActive(id, false, 'processing'); });
  showSample(false);
  showBadge(false);
}

async function playFlow(){
  if (playing) return;
  playing = true;
  var btn = document.getElementById('playBtn');
  btn.disabled = true;
  resetFlow();

  // a. Gmail requests access
  setStepLabel('Requesting inbox access — read-only, nothing else.');
  setActive('gmail', true);
  await delay(1000);
  setActive('gmail', false);

  // b. data lands in the browser, shield flashes
  flashShield();
  setActive('hub', true);
  setStepLabel('Everything stays in this browser tab.');
  await delay(900);
  setActive('hub', false);

  // c. local AI processes
  setActive('ai', true, 'processing');
  setStepLabel('A local model scans each email on your device.');
  await delay(1100);
  setActive('ai', false, 'processing');

  // d. back through the hub to results
  setActive('hub', true);
  await delay(500);
  setActive('hub', false);
  setActive('results', true);
  showSample(true);
  setStepLabel('A subscription turns up — written straight to the page.');
  await delay(900);

  // e. badge, spring animation
  showBadge(true);
  setStepLabel('1 service found. Nothing was stored or sent anywhere.');
  await delay(1500);

  setActive('results', false);
  btn.disabled = false;
  btn.textContent = 'Run again';
  playing = false;
}

document.getElementById('playBtn').addEventListener('click', playFlow);

// ---- 3. one-time hub pulse once the cinematic reveal has settled ----
window.addEventListener('load', function(){
  setTimeout(function(){
    var hub = document.getElementById('hub');
    hub.classList.add('pulse-once');
    setTimeout(function(){ hub.classList.remove('pulse-once'); }, 1000);
  }, 1700);
});
</script>

</body>
</html>
