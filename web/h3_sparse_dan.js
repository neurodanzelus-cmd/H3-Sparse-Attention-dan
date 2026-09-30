import { app } from "/scripts/app.js";

const NODE_ID = "H3SparseAttentionDan";
const CLASS_NAME = "H3SparseAttentionAdvanced";
const CURVE_WIDGET = "curve_data";
const DEFAULT_POINTS = [
  [0, 41 / 60],
  [8 / 19, 0.15],
  [1, 0.15],
];
const DEFAULT_PROFILES = { Default: DEFAULT_POINTS };

const STYLE_ID = "h3sa-curve-editor-style";

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .h3sa-overlay{position:fixed;inset:0;z-index:100000;background:rgba(4,8,16,.76);backdrop-filter:blur(12px);display:grid;place-items:center;padding:24px;font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;color:#edf2fa}
    .h3sa-dialog{width:min(940px,100%);max-height:min(800px,calc(100vh - 48px));overflow:auto;border:1px solid rgba(156,177,212,.2);border-radius:22px;background:linear-gradient(145deg,#151d2b,#101621 72%);box-shadow:0 28px 100px rgba(0,0,0,.62);padding:26px 28px 22px;outline:none}
    .h3sa-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:20px}
    .h3sa-eyebrow{font-size:10px;letter-spacing:.19em;font-weight:750;color:#8fa4c6;text-transform:uppercase;margin:1px 0 9px}
    .h3sa-title{font-size:24px;line-height:1.15;letter-spacing:-.035em;margin:0;font-weight:700;color:#f5f7fc}
    .h3sa-subtitle{margin:8px 0 0;color:#aab6ca;font-size:13px;line-height:1.5}
    .h3sa-close{border:1px solid rgba(156,177,212,.18);background:#1c2738;color:#aebbd0;width:36px;height:36px;border-radius:11px;font-size:20px;line-height:1;cursor:pointer;transition:.16s ease}
    .h3sa-close:hover{background:#29374d;color:#fff;border-color:rgba(156,177,212,.4)}
    .h3sa-chart-shell{position:relative;border:1px solid rgba(138,160,195,.15);border-radius:16px;background:radial-gradient(ellipse at 48% 0%,rgba(73,99,143,.13),transparent 62%),#0c121d;padding:12px 12px 0;overflow:hidden}
    .h3sa-chart-toolbar{min-height:32px;display:flex;align-items:center;justify-content:flex-end;flex-wrap:wrap;gap:9px;padding:4px 5px;color:#8493aa;font-size:11px}
    .h3sa-steps-status{margin-right:auto;color:#a7b4c9;font-variant-numeric:tabular-nums}
    .h3sa-refresh-steps{width:27px;height:27px;padding:5px;display:grid;place-items:center;border:1px solid rgba(151,171,204,.18);border-radius:8px;background:#182231;color:#aebbd0;cursor:pointer;transition:background .16s,border-color .16s,color .16s,transform .3s}
    .h3sa-refresh-steps:hover{background:#29374d;color:#fff;border-color:rgba(151,171,204,.4)}
    .h3sa-refresh-steps.is-refreshing{transform:rotate(180deg)}
    .h3sa-refresh-steps svg{display:block;width:15px;height:15px}
    .h3sa-toggle{display:inline-flex;align-items:center;gap:6px;white-space:nowrap;color:#a7b4c9;cursor:pointer;user-select:none}
    .h3sa-toggle input{width:13px;height:13px;margin:0;accent-color:#aeb8ff;cursor:pointer}
    .h3sa-profile-toolbar{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin:0 1px 14px}
    .h3sa-profile-label{display:flex;align-items:center;gap:8px;color:#8998ae;font-size:11px}
    .h3sa-profile-select,.h3sa-profile-name{border:1px solid rgba(151,171,204,.18);border-radius:9px;background:#182231;color:#dce5f4;padding:8px 10px;font:500 12px/1.1 Inter,ui-sans-serif,system-ui,sans-serif;outline:none}
    .h3sa-profile-select{min-width:148px}
    .h3sa-profile-name{width:142px}
    .h3sa-profile-select:focus-visible,.h3sa-profile-name:focus-visible{border-color:#9ba8ff;box-shadow:0 0 0 2px rgba(142,155,255,.2)}
    .h3sa-profile-message{margin-left:auto;font-size:11px;color:#718198}
    .h3sa-profile-message[data-state="error"]{color:#ff9b9b}
    .h3sa-chart{display:block;width:100%;height:360px;touch-action:none;outline:none;cursor:crosshair}
    .h3sa-chart:focus-visible{box-shadow:inset 0 0 0 2px #8a91ff;border-radius:9px}
    .h3sa-readout{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 5px 12px;border-top:1px solid rgba(138,160,195,.12);font-size:12px;color:#98a8c1}
    .h3sa-readout-values{display:flex;gap:16px;align-items:center;color:#dce5f4;font-variant-numeric:tabular-nums}
    .h3sa-readout-values strong{font-weight:680;color:#aeb9ff}
    .h3sa-hint{margin:12px 2px 0;font-size:12px;color:#8998ae;line-height:1.5}
    .h3sa-actions{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:20px}
    .h3sa-action-group{display:flex;gap:9px;align-items:center}
    .h3sa-btn{border:1px solid rgba(151,171,204,.2);border-radius:10px;padding:9px 14px;color:#d1daea;background:#202b3c;font:600 12px/1.2 Inter,ui-sans-serif,system-ui,sans-serif;cursor:pointer;transition:background .16s,border-color .16s,transform .16s}
    .h3sa-btn:hover:not(:disabled){background:#2a3950;border-color:rgba(151,171,204,.4);transform:translateY(-1px)}
    .h3sa-btn:disabled{opacity:.38;cursor:default}
    .h3sa-btn-primary{color:#101629;background:linear-gradient(135deg,#b9c3ff,#87d8e6);border:0;padding-inline:18px;box-shadow:0 5px 18px rgba(126,164,244,.17)}
    .h3sa-btn-primary:hover:not(:disabled){background:linear-gradient(135deg,#d0d6ff,#a7e7ef)}
    @media(max-width:620px){.h3sa-overlay{padding:12px}.h3sa-dialog{padding:19px 16px 16px;border-radius:17px}.h3sa-title{font-size:21px}.h3sa-chart{height:300px}.h3sa-readout{align-items:flex-start;flex-direction:column}.h3sa-actions{align-items:stretch;flex-direction:column-reverse}.h3sa-action-group{justify-content:flex-end}.h3sa-btn{flex:1}}
  `;
  document.head.append(style);
}

function normalizePoints(raw) {
  if (!Array.isArray(raw) || raw.length < 2 || raw.length > 64) return null;
  const points = raw.map((point) => {
    if (!Array.isArray(point) || point.length !== 2) return null;
    const x = Number(point[0]);
    const y = Number(point[1]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    return [Math.min(1, Math.max(0, x)), Math.min(1, Math.max(0.01, y))];
  });
  if (points.some((point) => point === null)) return null;
  points.sort((a, b) => a[0] - b[0]);
  if (points[0][0] > 0.000001 || points.at(-1)[0] < 0.999999) return null;
  points[0][0] = 0;
  points.at(-1)[0] = 1;
  if (points.some((point, index) => index > 0 && point[0] - points[index - 1][0] < 0.000001)) return null;
  return points;
}

function readPoints(widget) {
  try {
    return normalizePoints(JSON.parse(widget?.value ?? "")) ?? DEFAULT_POINTS.map((point) => [...point]);
  } catch {
    return DEFAULT_POINTS.map((point) => [...point]);
  }
}

function readProfiles(widget) {
  const profiles = Object.create(null);
  for (const [name, points] of Object.entries(DEFAULT_PROFILES)) {
    profiles[name] = points.map((point) => [...point]);
  }
  try {
    const saved = JSON.parse(widget?.value ?? "{}");
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) return profiles;
    for (const [name, rawPoints] of Object.entries(saved)) {
      if (
        !name.trim() || name.length > 40 ||
        name.toLocaleLowerCase() === "default" ||
        Object.keys(profiles).length >= 20
      ) continue;
      const points = normalizePoints(rawPoints);
      if (points) profiles[name] = points;
    }
  } catch {
    return profiles;
  }
  return profiles;
}

function sameCurve(left, right) {
  return left.length === right.length && left.every((point, index) =>
    Math.abs(point[0] - right[index][0]) < 0.000001 &&
    Math.abs(point[1] - right[index][1]) < 0.000001,
  );
}

function updateCanvas(node) {
  node.setDirtyCanvas?.(true, true);
  app.graph?.setDirtyCanvas?.(true, true);
}

function graphNodes(graph) {
  return graph?._nodes ?? graph?.nodes ?? [];
}

function graphLink(graph, id) {
  const links = graph?.links ?? graph?._links;
  if (links instanceof Map) return links.get(id);
  if (Array.isArray(links)) return links.find((link) => link?.id === id) ?? null;
  return links?.[id] ?? null;
}

function graphNodeById(graph, id) {
  if (id == null) return null;
  const direct = graph?.getNodeById?.(id);
  if (direct) return direct;
  const nodes = graphNodes(graph);
  if (nodes instanceof Map) return nodes.get(id) ?? nodes.get(String(id)) ?? null;
  if (Array.isArray(nodes)) return nodes.find((candidate) => String(candidate.id) === String(id)) ?? null;
  return nodes?.[id] ?? nodes?.[String(id)] ?? null;
}

function nodeClassName(node) {
  return String(node?.comfyClass ?? node?.type ?? node?.constructor?.ComfyClass ?? node?.title ?? "").toLowerCase();
}

function stepWidgetValue(node) {
  const widget = node?.widgets?.find((candidate) => /^(steps|num_steps|step_count)$/i.test(candidate?.name ?? ""));
  const value = Number(widget?.value);
  return Number.isFinite(value) && value >= 1 ? Math.min(4096, Math.round(value)) : null;
}

function findSamplerStepCount(startNode) {
  const graph = startNode?.graph ?? app.graph;
  if (!graph) return null;
  const queue = [{ node: startNode, depth: 0 }];
  const visited = new Set();
  const downstream = [];

  while (queue.length) {
    const entry = queue.shift();
    const current = entry.node;
    const id = String(current?.id ?? "");
    if (!current || visited.has(id)) continue;
    visited.add(id);
    downstream.push(entry);

    for (const output of current.outputs ?? []) {
      for (const linkId of output?.links ?? []) {
        const link = graphLink(graph, linkId);
        const targetId = link?.target_id ?? link?.targetId ?? link?.target;
        const target = graphNodeById(graph, targetId);
        if (target && !visited.has(String(target.id))) queue.push({ node: target, depth: entry.depth + 1 });
      }
    }
  }

  const candidates = [];
  for (const { node, depth } of downstream) {
    const kind = nodeClassName(node);
    const steps = stepWidgetValue(node);
    if (steps != null && /sampler|scheduler/.test(kind)) {
      candidates.push({ steps, depth, priority: /ksampler/.test(kind) ? 0 : 2, node });
    }

    const isSampler = /sampler/.test(kind);
    if (!isSampler) continue;
    for (const input of node.inputs ?? []) {
      if (!/^(sigmas|sigma|schedule)$/i.test(input?.name ?? "") || input.link == null) continue;
      const link = graphLink(graph, input.link);
      const sourceId = link?.origin_id ?? link?.originId ?? link?.origin;
      const scheduler = graphNodeById(graph, sourceId);
      const schedulerSteps = stepWidgetValue(scheduler);
      if (scheduler && schedulerSteps != null && /scheduler/.test(nodeClassName(scheduler))) {
        candidates.push({ steps: schedulerSteps, depth, priority: 0, node: scheduler });
      }
    }
  }

  candidates.sort((left, right) => left.priority - right.priority || left.depth - right.depth);
  return candidates[0] ?? null;
}

function openCurveEditor(node, widget, profilesWidget) {
  installStyles();
  const points = readPoints(widget).map((point) => [...point]);
  const profiles = readProfiles(profilesWidget);
  let activeProfile = Object.entries(profiles).find(([, curve]) => sameCurve(curve, points))?.[0] ?? "";
  let selected = 0;
  let dragIndex = -1;
  let detectedStepCount = findSamplerStepCount(node);
  let previewSteps = detectedStepCount?.steps ?? 0;
  let showStepValues = true;
  let showCurve = true;
  let hoverStep = -1;
  const abort = new AbortController();
  const previousOverflow = document.body.style.overflow;

  const overlay = document.createElement("div");
  overlay.className = "h3sa-overlay";
  overlay.innerHTML = `
    <section class="h3sa-dialog" role="dialog" aria-modal="true" aria-labelledby="h3sa-title" tabindex="-1">
      <header class="h3sa-head">
        <div>
          <div class="h3sa-eyebrow">H3 · Sparse control</div>
          <h2 class="h3sa-title" id="h3sa-title">Attention curve</h2>
          <p class="h3sa-subtitle">Shape how much video attention is kept as sampling progresses.</p>
        </div>
        <button class="h3sa-close" type="button" aria-label="Close editor">×</button>
      </header>
      <div class="h3sa-profile-toolbar">
        <label class="h3sa-profile-label">Profile<select class="h3sa-profile-select" aria-label="Select attention curve profile"></select></label>
        <input class="h3sa-profile-name" type="text" maxlength="40" placeholder="New profile name" aria-label="Profile name">
        <button class="h3sa-btn h3sa-save-profile" type="button">Save profile</button>
        <button class="h3sa-btn h3sa-delete-profile" type="button">Delete</button>
        <span class="h3sa-profile-message" aria-live="polite">Saved with this workflow</span>
      </div>
      <div class="h3sa-chart-shell">
        <div class="h3sa-chart-toolbar"><span class="h3sa-steps-status" aria-live="polite"></span><button class="h3sa-refresh-steps" type="button" aria-label="Refresh step count" title="Refresh step count"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M16.4 7.2A6.8 6.8 0 0 0 4.7 5.1L3.2 6.6M3.2 6.6V3.5M3.2 6.6h3.1M3.6 12.8a6.8 6.8 0 0 0 11.7 2.1l1.5-1.5m0 0v3.1m0-3.1h-3.1" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></button><label class="h3sa-toggle"><input class="h3sa-step-values" type="checkbox" checked>Step values</label><label class="h3sa-toggle"><input class="h3sa-show-curve" type="checkbox" checked>Show curve</label></div>
        <canvas class="h3sa-chart" tabindex="0" aria-label="Attention budget curve. Click to add points and drag to edit."></canvas>
        <div class="h3sa-readout" aria-live="polite">
          <span class="h3sa-selected-label">Selected point</span>
          <span class="h3sa-readout-values"><span>Progress <strong class="h3sa-x-value"></strong></span><span>Budget <strong class="h3sa-y-value"></strong></span><button class="h3sa-btn h3sa-remove" type="button">Remove point</button></span>
        </div>
      </div>
      <p class="h3sa-hint">Click in the graph to add a point. Drag points to shape the curve. The first and last points stay at the edges; Delete removes a selected middle point. Step columns follow the connected sampler. After changing Scheduler steps, click refresh to update the graph without running generation. Step values stay compact with many columns; hover a column for its exact value. Hiding the curve leaves its column values unchanged.</p>
      <footer class="h3sa-actions">
        <button class="h3sa-btn h3sa-reset" type="button">Reset curve</button>
        <div class="h3sa-action-group"><button class="h3sa-btn h3sa-cancel" type="button">Cancel</button><button class="h3sa-btn h3sa-btn-primary h3sa-apply" type="button">Apply curve</button></div>
      </footer>
    </section>`;

  const dialog = overlay.querySelector(".h3sa-dialog");
  const canvas = overlay.querySelector("canvas");
  const context = canvas.getContext("2d");
  const xValue = overlay.querySelector(".h3sa-x-value");
  const yValue = overlay.querySelector(".h3sa-y-value");
  const selectedLabel = overlay.querySelector(".h3sa-selected-label");
  const removeButton = overlay.querySelector(".h3sa-remove");
  const stepCountStatus = overlay.querySelector(".h3sa-steps-status");
  const refreshStepsButton = overlay.querySelector(".h3sa-refresh-steps");
  const stepValuesToggle = overlay.querySelector(".h3sa-step-values");
  const showCurveToggle = overlay.querySelector(".h3sa-show-curve");
  const profileSelect = overlay.querySelector(".h3sa-profile-select");
  const profileNameInput = overlay.querySelector(".h3sa-profile-name");
  const profileMessage = overlay.querySelector(".h3sa-profile-message");
  const deleteProfileButton = overlay.querySelector(".h3sa-delete-profile");

  function refreshStepCount() {
    detectedStepCount = findSamplerStepCount(node);
    previewSteps = detectedStepCount?.steps ?? 0;
    hoverStep = -1;
    stepCountStatus.textContent = detectedStepCount
      ? `${previewSteps} sampler steps`
      : "Steps not found";
    refreshStepsButton.title = detectedStepCount?.node?.title
      ? `Refresh from ${detectedStepCount.node.title}`
      : "Try to find connected sampler steps again";
    render();
  }

  function refreshProfiles() {
    profileSelect.replaceChildren();
    if (!activeProfile) {
      const custom = document.createElement("option");
      custom.value = "";
      custom.textContent = "Custom curve";
      profileSelect.append(custom);
    }
    for (const name of Object.keys(profiles)) {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      profileSelect.append(option);
    }
    profileSelect.value = activeProfile;
    deleteProfileButton.disabled = !activeProfile || activeProfile === "Default";
    if (activeProfile && activeProfile !== "Default") profileNameInput.value = activeProfile;
    else profileNameInput.value = "";
  }

  function setProfileMessage(message, isError = false) {
    profileMessage.textContent = message;
    profileMessage.dataset.state = isError ? "error" : "";
  }

  function markCurveCustom() {
    if (!activeProfile) return;
    activeProfile = "";
    refreshProfiles();
  }

  function persistProfiles(saveCurve = true) {
    profilesWidget.value = JSON.stringify(profiles);
    profilesWidget.callback?.(profilesWidget.value);
    if (saveCurve) {
      widget.value = JSON.stringify(points.map(([x, y]) => [Number(x.toFixed(6)), Number(y.toFixed(6))]));
      widget.callback?.(widget.value);
    }
    updateCanvas(node);
  }

  refreshProfiles();

  function plotGeometry(width, height) {
    return { left: 58, right: width - 20, top: 20, bottom: height - 43 };
  }

  function pointToCanvas(point, plot) {
    return [
      plot.left + point[0] * (plot.right - plot.left),
      plot.bottom - ((point[1] - 0.01) / 0.99) * (plot.bottom - plot.top),
    ];
  }

  function sampleCurve(progress) {
    for (let index = 0; index < points.length - 1; index += 1) {
      const [leftX, leftY] = points[index];
      const [rightX, rightY] = points[index + 1];
      if (progress <= rightX) {
        const fraction = (progress - leftX) / (rightX - leftX);
        return leftY * (1 - fraction) + rightY * fraction;
      }
    }
    return points.at(-1)[1];
  }

  function canvasToPoint(clientX, clientY) {
    const bounds = canvas.getBoundingClientRect();
    const plot = plotGeometry(bounds.width, bounds.height);
    return [
      Math.min(1, Math.max(0, (clientX - bounds.left - plot.left) / (plot.right - plot.left))),
      Math.min(1, Math.max(0.01, 0.01 + ((plot.bottom - (clientY - bounds.top)) / (plot.bottom - plot.top)) * 0.99)),
    ];
  }

  function drawStepValue(index, sample, plot, highlighted = false) {
    const precision = highlighted ? 1 : 0;
    const label = `${index + 1} · ${(sample.value * 100).toFixed(precision)}%`;
    context.font = '600 10px Inter, ui-sans-serif, system-ui, sans-serif';
    const pillWidth = Math.ceil(context.measureText(label).width) + 12;
    const pillHeight = 19;
    const centerX = Math.min(plot.right - pillWidth / 2, Math.max(plot.left + pillWidth / 2, sample.x));
    const centerY = Math.max(plot.top + pillHeight / 2 + 2, sample.y - 13);
    const left = centerX - pillWidth / 2;
    const top = centerY - pillHeight / 2;
    context.fillStyle = highlighted ? "rgba(174,190,255,.98)" : "rgba(17,25,38,.9)";
    context.strokeStyle = highlighted ? "rgba(225,232,255,.95)" : "rgba(174,190,255,.35)";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(left + 7, top);
    context.lineTo(left + pillWidth - 7, top);
    context.quadraticCurveTo(left + pillWidth, top, left + pillWidth, top + 7);
    context.lineTo(left + pillWidth, top + pillHeight - 7);
    context.quadraticCurveTo(left + pillWidth, top + pillHeight, left + pillWidth - 7, top + pillHeight);
    context.lineTo(left + 7, top + pillHeight);
    context.quadraticCurveTo(left, top + pillHeight, left, top + pillHeight - 7);
    context.lineTo(left, top + 7);
    context.quadraticCurveTo(left, top, left + 7, top);
    context.closePath();
    context.fill();
    context.stroke();
    context.fillStyle = highlighted ? "#111827" : "#dce5f5";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(label, centerX, centerY + 0.5);
  }

  function render() {
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    const scale = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.clearRect(0, 0, width, height);

    const plot = plotGeometry(width, height);
    context.font = '11px Inter, ui-sans-serif, system-ui, sans-serif';
    context.textBaseline = "middle";
    context.lineWidth = 1;
    context.strokeStyle = "rgba(147,166,198,.12)";
    context.fillStyle = "#7f8da5";
    for (const tick of [1, 0.75, 0.5, 0.25, 0.01]) {
      const y = pointToCanvas([0, tick], plot)[1];
      context.beginPath();
      context.moveTo(plot.left, y);
      context.lineTo(plot.right, y);
      context.stroke();
      context.textAlign = "right";
      context.fillText(`${Math.round(tick * 100)}%`, plot.left - 12, y);
    }
    for (const tick of [0, 0.25, 0.5, 0.75, 1]) {
      const x = plot.left + tick * (plot.right - plot.left);
      context.beginPath();
      context.moveTo(x, plot.top);
      context.lineTo(x, plot.bottom);
      context.stroke();
      context.textAlign = tick === 0 ? "left" : tick === 1 ? "right" : "center";
      context.fillText(`${Math.round(tick * 100)}%`, x, plot.bottom + 19);
    }
    context.textAlign = "left";
    context.fillStyle = "#74839a";
    context.fillText("ATTENTION BUDGET", plot.left, 8);
    context.textAlign = "right";
    context.fillText("SAMPLER PROGRESS", plot.right, height - 7);

    const coords = points.map((point) => pointToCanvas(point, plot));
    if (showCurve) {
      const fill = context.createLinearGradient(0, plot.top, 0, plot.bottom);
      fill.addColorStop(0, "rgba(144,154,255,.2)");
      fill.addColorStop(1, "rgba(102,205,222,.015)");
      context.beginPath();
      context.moveTo(coords[0][0], plot.bottom);
      context.lineTo(coords[0][0], coords[0][1]);
      for (let index = 1; index < coords.length; index += 1) context.lineTo(coords[index][0], coords[index][1]);
      context.lineTo(coords.at(-1)[0], plot.bottom);
      context.closePath();
      context.fillStyle = fill;
      context.fill();
    }

    const samples = [];
    if (previewSteps > 0) {
      const stepWidth = (plot.right - plot.left) / previewSteps;
      const barWidth = Math.min(30, Math.max(2, stepWidth * 0.42));
      for (let index = 0; index < previewSteps; index += 1) {
        const progress = (index + 0.5) / previewSteps;
        const value = sampleCurve(progress);
        const [centerX, topY] = pointToCanvas([progress, value], plot);
        samples.push({ x: centerX, y: topY, value });
        const x = centerX - barWidth / 2;
        const radius = Math.min(3, barWidth / 2, (plot.bottom - topY) / 2);
        context.fillStyle = index === hoverStep && showStepValues
          ? "rgba(174,190,255,.48)"
          : "rgba(178,192,215,.19)";
        context.beginPath();
        context.moveTo(x, plot.bottom);
        context.lineTo(x, topY + radius);
        context.quadraticCurveTo(x, topY, x + radius, topY);
        context.lineTo(x + barWidth - radius, topY);
        context.quadraticCurveTo(x + barWidth, topY, x + barWidth, topY + radius);
        context.lineTo(x + barWidth, plot.bottom);
        context.closePath();
        context.fill();
      }
    }

    if (showCurve) {
      const stroke = context.createLinearGradient(plot.left, 0, plot.right, 0);
      stroke.addColorStop(0, "#a9b3ff");
      stroke.addColorStop(0.52, "#8fc8e8");
      stroke.addColorStop(1, "#81e0d0");
      context.beginPath();
      context.moveTo(coords[0][0], coords[0][1]);
      for (let index = 1; index < coords.length; index += 1) context.lineTo(coords[index][0], coords[index][1]);
      context.lineWidth = 3;
      context.lineJoin = "round";
      context.lineCap = "round";
      context.strokeStyle = stroke;
      context.shadowColor = "rgba(138,173,255,.24)";
      context.shadowBlur = 11;
      context.stroke();
      context.shadowBlur = 0;

      coords.forEach(([x, y], index) => {
        const active = index === selected;
        context.beginPath();
        context.arc(x, y, active ? 7 : 5, 0, Math.PI * 2);
        context.fillStyle = active ? "#f3f5ff" : "#aab4ff";
        context.fill();
        context.lineWidth = active ? 3 : 2;
        context.strokeStyle = active ? "#8e9bff" : "#29364b";
        context.stroke();
      });
    }

    if (showStepValues && previewSteps > 0) {
      const maxLabels = Math.max(4, Math.floor((plot.right - plot.left) / 64));
      const labelStride = Math.max(1, Math.ceil(previewSteps / maxLabels));
      const labelIndexes = new Set();
      for (let index = 0; index < previewSteps; index += labelStride) labelIndexes.add(index);
      labelIndexes.add(previewSteps - 1);
      if (hoverStep >= 0) labelIndexes.add(hoverStep);
      for (const index of labelIndexes) {
        drawStepValue(index, samples[index], plot, index === hoverStep);
      }
    }

    if (previewSteps < 1) {
      context.save();
      context.globalAlpha = 0.58;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = "#cbd6e9";
      context.font = '600 14px Inter, ui-sans-serif, system-ui, sans-serif';
      context.fillText("STEPS NOT DETECTED", (plot.left + plot.right) / 2, (plot.top + plot.bottom) / 2 - 10);
      context.globalAlpha = 0.43;
      context.font = '11px Inter, ui-sans-serif, system-ui, sans-serif';
      context.fillText("Click ↻ to try again", (plot.left + plot.right) / 2, (plot.top + plot.bottom) / 2 + 14);
      context.restore();
    }

    const point = points[selected];
    xValue.textContent = `${Math.round(point[0] * 100)}%`;
    yValue.textContent = `${(point[1] * 100).toFixed(1)}%`;
    selectedLabel.textContent = `Point ${selected + 1} of ${points.length}`;
    removeButton.disabled = !showCurve || selected === 0 || selected === points.length - 1;
  }

  function close() {
    abort.abort();
    overlay.remove();
    document.body.style.overflow = previousOverflow;
  }

  function apply() {
    const normalized = points.map(([x, y]) => [Number(x.toFixed(6)), Number(y.toFixed(6))]);
    widget.value = JSON.stringify(normalized);
    widget.callback?.(widget.value);
    updateCanvas(node);
    close();
  }

  canvas.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    canvas.focus();
    if (!showCurve) return;
    const rect = canvas.getBoundingClientRect();
    const plot = plotGeometry(rect.width, rect.height);
    const clicked = [event.clientX - rect.left, event.clientY - rect.top];
    if (
      clicked[0] < plot.left || clicked[0] > plot.right ||
      clicked[1] < plot.top || clicked[1] > plot.bottom
    ) return;
    let nearestIndex = -1;
    let nearestDistance = 18;
    points.forEach((point, index) => {
      const [px, py] = pointToCanvas(point, plot);
      const distance = Math.hypot(px - clicked[0], py - clicked[1]);
      if (distance < nearestDistance) {
        nearestIndex = index;
        nearestDistance = distance;
      }
    });
    if (nearestIndex >= 0) {
      selected = nearestIndex;
      dragIndex = nearestIndex;
      canvas.setPointerCapture(event.pointerId);
      render();
      return;
    }

    if (points.length >= 64) return;
    const [x, y] = canvasToPoint(event.clientX, event.clientY);
    const index = points.findIndex((point) => point[0] > x);
    const insertAt = Math.max(1, Math.min(points.length - 1, index < 0 ? points.length - 1 : index));
    const minX = points[insertAt - 1][0] + 0.005;
    const maxX = points[insertAt][0] - 0.005;
    if (minX > maxX) return;
    points.splice(insertAt, 0, [Math.min(maxX, Math.max(minX, x)), y]);
    selected = insertAt;
    dragIndex = insertAt;
    markCurveCustom();
    canvas.setPointerCapture(event.pointerId);
    render();
  }, { signal: abort.signal });

  canvas.addEventListener("pointermove", (event) => {
    if (dragIndex < 0) {
      const bounds = canvas.getBoundingClientRect();
      const plot = plotGeometry(bounds.width, bounds.height);
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const nextHoverStep = showStepValues && previewSteps > 0 && x >= plot.left && x <= plot.right && y >= plot.top && y <= plot.bottom
        ? Math.min(previewSteps - 1, Math.floor(((x - plot.left) / (plot.right - plot.left)) * previewSteps))
        : -1;
      if (nextHoverStep !== hoverStep) {
        hoverStep = nextHoverStep;
        render();
      }
      return;
    }
    const [x, y] = canvasToPoint(event.clientX, event.clientY);
    const minX = dragIndex === 0 ? 0 : points[dragIndex - 1][0] + 0.005;
    const maxX = dragIndex === points.length - 1 ? 1 : points[dragIndex + 1][0] - 0.005;
    const nextX = dragIndex === 0 || dragIndex === points.length - 1
      ? points[dragIndex][0]
      : Math.min(maxX, Math.max(minX, x));
    if (Math.abs(nextX - points[dragIndex][0]) > 0.000001 || Math.abs(y - points[dragIndex][1]) > 0.000001) {
      points[dragIndex][0] = nextX;
      points[dragIndex][1] = y;
      markCurveCustom();
    }
    render();
  }, { signal: abort.signal });

  canvas.addEventListener("pointerleave", () => {
    if (dragIndex < 0 && hoverStep >= 0) {
      hoverStep = -1;
      render();
    }
  }, { signal: abort.signal });

  const stopDrag = () => { dragIndex = -1; };
  canvas.addEventListener("pointerup", stopDrag, { signal: abort.signal });
  canvas.addEventListener("pointercancel", stopDrag, { signal: abort.signal });
  canvas.addEventListener("keydown", (event) => {
    if (showCurve && (event.key === "Delete" || event.key === "Backspace") && selected > 0 && selected < points.length - 1) {
      event.preventDefault();
      points.splice(selected, 1);
      selected = Math.max(0, selected - 1);
      markCurveCustom();
      render();
    }
    if (event.key === "Escape") close();
  }, { signal: abort.signal });

  removeButton.addEventListener("click", () => {
    if (selected === 0 || selected === points.length - 1) return;
    points.splice(selected, 1);
    selected = Math.max(0, selected - 1);
    markCurveCustom();
    render();
  }, { signal: abort.signal });
  profileSelect.addEventListener("change", () => {
    const name = profileSelect.value;
    if (!profiles[name]) return;
    points.splice(0, points.length, ...profiles[name].map((point) => [...point]));
    selected = 0;
    activeProfile = name;
    profileNameInput.value = name === "Default" ? "" : name;
    setProfileMessage("Profile loaded · apply to use it");
    refreshProfiles();
    render();
  }, { signal: abort.signal });
  overlay.querySelector(".h3sa-save-profile").addEventListener("click", () => {
    const requestedName = profileNameInput.value.trim();
    if (!requestedName || requestedName.length > 40) {
      setProfileMessage("Enter a name of up to 40 characters", true);
      return;
    }
    const existingName = Object.keys(profiles).find(
      (name) => name.toLocaleLowerCase() === requestedName.toLocaleLowerCase(),
    );
    if (existingName === "Default") {
      setProfileMessage("Default profile is protected", true);
      return;
    }
    if (!existingName && Object.keys(profiles).length >= 20) {
      setProfileMessage("Profile limit reached (20)", true);
      return;
    }
    const name = existingName ?? requestedName;
    profiles[name] = points.map((point) => [...point]);
    activeProfile = name;
    refreshProfiles();
    persistProfiles();
    setProfileMessage(`Saved “${name}” with this workflow`);
  }, { signal: abort.signal });
  deleteProfileButton.addEventListener("click", () => {
    if (!activeProfile || activeProfile === "Default") return;
    const deletedName = activeProfile;
    delete profiles[deletedName];
    activeProfile = "";
    refreshProfiles();
    persistProfiles(false);
    setProfileMessage(`Deleted “${deletedName}” from this workflow`);
  }, { signal: abort.signal });
  refreshStepsButton.addEventListener("click", () => {
    refreshStepsButton.classList.add("is-refreshing");
    window.setTimeout(() => refreshStepsButton.classList.remove("is-refreshing"), 320);
    refreshStepCount();
  }, { signal: abort.signal });
  stepValuesToggle.addEventListener("change", () => {
    showStepValues = stepValuesToggle.checked;
    if (!showStepValues) hoverStep = -1;
    render();
  }, { signal: abort.signal });
  showCurveToggle.addEventListener("change", () => {
    showCurve = showCurveToggle.checked;
    canvas.style.cursor = showCurve ? "crosshair" : "default";
    render();
  }, { signal: abort.signal });
  overlay.querySelector(".h3sa-reset").addEventListener("click", () => {
    points.splice(0, points.length, ...DEFAULT_POINTS.map((point) => [...point]));
    selected = 0;
    activeProfile = "Default";
    refreshProfiles();
    setProfileMessage("Default curve loaded · apply to use it");
    render();
  }, { signal: abort.signal });
  overlay.querySelector(".h3sa-apply").addEventListener("click", apply, { signal: abort.signal });
  overlay.querySelector(".h3sa-cancel").addEventListener("click", close, { signal: abort.signal });
  overlay.querySelector(".h3sa-close").addEventListener("click", close, { signal: abort.signal });
  overlay.addEventListener("pointerdown", (event) => {
    if (event.target === overlay) close();
  }, { signal: abort.signal });
  overlay.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  }, { signal: abort.signal });

  document.body.append(overlay);
  document.body.style.overflow = "hidden";
  dialog.focus();
  refreshStepCount();
  render();
  const resizeObserver = new ResizeObserver(render);
  resizeObserver.observe(canvas);
  abort.signal.addEventListener("abort", () => resizeObserver.disconnect(), { once: true });
}

function enhanceNode(node) {
  if (node.__h3SparseCurveReady) return;
  const widget = node.widgets?.find((entry) => entry.name === CURVE_WIDGET);
  const profilesWidget = node.widgets?.find((entry) => entry.name === "curve_profiles");
  const legacyProtectAudioWidget = node.widgets?.find((entry) => entry.name === "protect_audio");
  if (!widget || !profilesWidget) return;
  node.__h3SparseCurveReady = true;
  for (const hiddenWidget of [widget, profilesWidget, legacyProtectAudioWidget].filter(Boolean)) {
    hiddenWidget.hidden = true;
    hiddenWidget.options = { ...hiddenWidget.options, hidden: true };
    hiddenWidget.computeSize = () => [0, -4];
    hiddenWidget.draw = () => {};
    hiddenWidget.serialize = true;
  }
  const button = node.addWidget(
    "button",
    "Edit attention curve",
    null,
    () => openCurveEditor(node, widget, profilesWidget),
  );
  if (button) button.serialize = false;
  node.setSize?.(node.computeSize?.() ?? node.size);
  updateCanvas(node);
}

app.registerExtension({
  name: "H3SparseAttentionDan.CurveEditor",
  beforeRegisterNodeDef(nodeType, nodeData) {
    if (
      nodeData?.name !== NODE_ID &&
      nodeData?.display_name !== "H3 Sparse Attention (dan)" &&
      nodeType?.ComfyClass !== CLASS_NAME
    ) return;
    const original = nodeType.prototype.onNodeCreated;
    nodeType.prototype.onNodeCreated = function (...args) {
      const result = original?.apply(this, args);
      enhanceNode(this);
      return result;
    };
  },
});
