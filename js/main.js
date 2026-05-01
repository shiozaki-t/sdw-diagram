/* ---------- state ---------- */
let mode = 'physical';      // 'physical' | 'info' | 'human'
let selectedPhase = null;
let activeStakeholders = new Set();
let overviewSim = null;

/* ---------- init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  buildSidebar();
  buildModeToggle();
  renderMode();
  window.addEventListener('resize', renderMode);
});

/* ---------- sidebar ---------- */
function buildSidebar() {
  const container = document.getElementById('stakeholder-list');

  // group by group
  const groups = [
    { key: 'upstream',   label: '川上' },
    { key: 'mid',        label: '中間' },
    { key: 'downstream', label: '川下' },
    { key: 'cross',      label: '横断' },
    { key: 'end',        label: '終端' },
  ];

  groups.forEach(g => {
    const members = STAKEHOLDERS.filter(s => s.group === g.key);
    if (!members.length) return;

    const sec = document.createElement('div');
    sec.className = 'sidebar-section';
    sec.innerHTML = `<h2>${g.label}</h2>`;

    members.forEach(s => {
      const item = document.createElement('div');
      item.className = 'stakeholder-item';
      item.dataset.id = s.id;
      item.innerHTML = `<span class="stakeholder-dot" style="background:${s.color}"></span>${s.label}`;
      item.addEventListener('click', () => toggleStakeholder(s.id));
      sec.appendChild(item);
    });

    container.appendChild(sec);
  });

  document.getElementById('btn-clear').addEventListener('click', () => {
    activeStakeholders.clear();
    document.querySelectorAll('.stakeholder-item').forEach(el => el.classList.remove('active'));
    renderMode();
  });
}

function toggleStakeholder(id) {
  if (activeStakeholders.has(id)) {
    activeStakeholders.delete(id);
  } else {
    activeStakeholders.add(id);
  }
  document.querySelectorAll('.stakeholder-item').forEach(el => {
    el.classList.toggle('active', activeStakeholders.has(el.dataset.id));
  });
  renderMode();
}

/* ---------- mode toggle ---------- */
function buildModeToggle() {
  document.getElementById('btn-physical').addEventListener('click', () => setMode('physical'));
  document.getElementById('btn-info').addEventListener('click', () => setMode('info'));
  document.getElementById('btn-human').addEventListener('click', () => setMode('human'));
}

function setMode(m) {
  mode = m;
  document.getElementById('btn-physical').classList.toggle('active', m === 'physical');
  document.getElementById('btn-info').classList.toggle('active', m === 'info');
  document.getElementById('btn-human').classList.toggle('active', m === 'human');
  renderMode();
}

/* ---------- render dispatch ---------- */
function renderMode() {
  if (overviewSim) { overviewSim.stop(); overviewSim = null; }
  const svgEl = document.getElementById('svg-root');
  const rect = svgEl.getBoundingClientRect();
  const W = rect.width || window.innerWidth - 220;
  const H = rect.height || window.innerHeight - 60;

  const svg = d3.select('#svg-root');
  svg.selectAll('*').remove();

  // zoom
  const zoom = d3.zoom().scaleExtent([0.3, 3]).on('zoom', e => {
    svg.select('.root-g').attr('transform', e.transform);
  });
  svg.call(zoom);
  svg.append('g').attr('class', 'root-g');

  if (mode === 'physical')  renderPhysical(svg, W, H);
  else if (mode === 'info') renderInfo(svg, W, H);
  else                      renderHuman(svg, W, H);
}


function renderStakeholderDots(g, phasePos) {
  const selected = STAKEHOLDERS.filter(s => activeStakeholders.has(s.id));

  selected.forEach(s => {
    s.phases.forEach(phId => {
      const ph = phasePos.find(p => p.id === phId);
      if (!ph) return;
      const angle = Math.random() * Math.PI * 2;
      const r = 30 + Math.random() * 15;
      g.append('circle')
        .attr('cx', ph.cx + Math.cos(angle) * r)
        .attr('cy', ph.cy + Math.sin(angle) * r)
        .attr('r', 5)
        .attr('fill', s.color)
        .attr('stroke', '#0f1a14')
        .attr('stroke-width', 1)
        .append('title').text(s.label);
    });
  });
}

/* ---------- layer renderers ---------- */
function renderPhysical(svg, W, H) {
  buildPhysicalLayer(svg.select('.root-g'), W, H, activeStakeholders);
}

function renderInfo(svg, W, H) {
  buildInfoLayer(svg.select('.root-g'), W, H, activeStakeholders);
}

function renderHuman(svg, W, H) {
  buildChordDiagram(svg.select('.root-g'), W, H, activeStakeholders);
}

/* ---------- helpers ---------- */
function phaseIsActive(phaseId) {
  return [...activeStakeholders].some(sid => {
    const s = STAKEHOLDERS.find(x => x.id === sid);
    return s && s.phases.includes(phaseId);
  });
}

function connIsActive(conn) {
  return phaseIsActive(conn.source) || phaseIsActive(conn.target);
}

function selectPhase(id) {
  selectedPhase = selectedPhase === id ? null : id;
  const p = PHASES.find(x => x.id === id);
  document.getElementById('info-panel').textContent =
    selectedPhase ? `${p.icon} ${p.label} — ${p.description}` : 'フェーズをクリックして詳細を表示';
  renderMode();
}

/* ---------- tooltip ---------- */
const tooltip = document.getElementById('tooltip');

function showTooltip(event, p) {
  const phStakeholders = STAKEHOLDERS.filter(s => s.phases.includes(p.id));
  tooltip.innerHTML = `<h3>${p.icon} ${p.label}</h3><div>${p.description}</div><div style="margin-top:6px;color:#78746D;font-size:0.75rem">${phStakeholders.map(s => s.label).join(' · ')}</div>`;
  tooltip.classList.add('visible');
  movTooltip(event);
}

function movTooltip(event) {
  const canvas = document.getElementById('main-canvas').getBoundingClientRect();
  tooltip.style.left = (event.clientX - canvas.left + 12) + 'px';
  tooltip.style.top  = (event.clientY - canvas.top  + 12) + 'px';
}

function hideTooltip() { tooltip.classList.remove('visible'); }
