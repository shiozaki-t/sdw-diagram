// Chord diagram — stakeholder-to-stakeholder relationship view
function buildChordDiagram(g, width, height, activeStakeholders) {
  g.selectAll('.chord-layer').remove();

  const hasFilter = activeStakeholders.size > 0;

  // Cluster by group for readable flow: upstream → mid → downstream → cross → end
  const groupOrder = ['upstream', 'mid', 'downstream', 'cross', 'end'];
  const nodes = [...STAKEHOLDERS].sort((a, b) =>
    groupOrder.indexOf(a.group) - groupOrder.indexOf(b.group)
  );
  const n = nodes.length;
  const idxMap = new Map(nodes.map((s, i) => [s.id, i]));

  // Symmetric weighted matrix (weight = number of shared phases per connection)
  const matrix = Array.from({ length: n }, () => new Array(n).fill(0));
  STAKEHOLDER_CONNECTIONS.forEach(c => {
    const si = idxMap.get(c.source);
    const ti = idxMap.get(c.target);
    if (si == null || ti == null) return;
    const w = c.phases.length;
    matrix[si][ti] += w;
    matrix[ti][si] += w;
  });

  const chordLayout = d3.chord().padAngle(0.028).sortSubgroups(d3.descending);
  const chords = chordLayout(matrix);

  const size  = Math.min(width, height);
  const outerR = size * 0.37;
  const innerR = outerR - 18;
  const labelR = outerR + 14;

  const arcGen    = d3.arc().innerRadius(innerR).outerRadius(outerR);
  const ribbonGen = d3.ribbon().radius(innerR - 1);

  const wrap = g.append('g')
    .attr('class', 'chord-layer')
    .attr('transform', `translate(${width / 2},${height / 2})`);

  // ---- Ribbons ----
  const ribbons = wrap.append('g')
    .selectAll('path')
    .data(chords)
    .join('path')
      .attr('d', ribbonGen)
      .attr('fill', d => nodes[d.source.index].color)
      .attr('stroke', 'none')
      .attr('opacity', d => chordRibbonOpacity(d, hasFilter, activeStakeholders, nodes));

  // ---- Arcs + labels ----
  const arcGs = wrap.append('g')
    .selectAll('g')
    .data(chords.groups)
    .join('g')
    .style('cursor', 'pointer');

  arcGs.append('path')
    .attr('d', arcGen)
    .attr('fill', d => nodes[d.index].color)
    .attr('stroke', '#F6F4EF')
    .attr('stroke-width', 0.5)
    .attr('opacity', d => chordArcOpacity(d, hasFilter, activeStakeholders, nodes));

  arcGs.append('text')
    .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
    .attr('dy', '0.35em')
    .attr('transform', d => {
      const angle  = (d.startAngle + d.endAngle) / 2;
      const rotate = angle * 180 / Math.PI - 90;
      const flip   = angle > Math.PI ? 'rotate(180)' : '';
      return `rotate(${rotate}) translate(${labelR}) ${flip}`;
    })
    .attr('text-anchor', d => (d.startAngle + d.endAngle) / 2 > Math.PI ? 'end' : 'start')
    .attr('fill', d =>
      hasFilter && !activeStakeholders.has(nodes[d.index].id) ? '#A8A49C' : '#1A1816'
    )
    .attr('font-size', 9.5)
    .attr('letter-spacing', '0.03em')
    .attr('pointer-events', 'none')
    .text(d => nodes[d.index].label);

  // Layer label (positioned in SVG coords, not in wrap)
  g.append('text')
    .attr('x', 16).attr('y', 22)
    .attr('fill', '#78746D').attr('font-size', 8.5).attr('font-weight', 700)
    .attr('letter-spacing', '0.22em').text('HUMAN LAYER');

  // ---- Hover ----
  arcGs
    .on('mouseenter', function(event, d) {
      ribbons.attr('opacity', r =>
        r.source.index === d.index || r.target.index === d.index ? 0.72 : 0.04
      );
      const node = nodes[d.index];
      const partners = STAKEHOLDER_CONNECTIONS
        .filter(c => c.source === node.id || c.target === node.id)
        .map(c => {
          const oid = c.source === node.id ? c.target : c.source;
          return STAKEHOLDERS.find(s => s.id === oid)?.label;
        })
        .filter(Boolean);
      const tt = document.getElementById('tooltip');
      tt.innerHTML = `<h3>${node.label}</h3><div style="color:#666;font-size:0.72rem;margin-top:4px;letter-spacing:0.03em">${partners.join(' · ')}</div>`;
      tt.classList.add('visible');
      chordMoveTooltip(event);
    })
    .on('mousemove', chordMoveTooltip)
    .on('mouseleave', function() {
      ribbons.attr('opacity', d => chordRibbonOpacity(d, hasFilter, activeStakeholders, nodes));
      document.getElementById('tooltip').classList.remove('visible');
    });
}

function chordRibbonOpacity(d, hasFilter, activeStakeholders, nodes) {
  if (!hasFilter) return 0.3;
  const sId = nodes[d.source.index].id;
  const tId = nodes[d.target.index].id;
  return activeStakeholders.has(sId) || activeStakeholders.has(tId) ? 0.65 : 0.04;
}

function chordArcOpacity(d, hasFilter, activeStakeholders, nodes) {
  if (!hasFilter) return 0.85;
  return activeStakeholders.has(nodes[d.index].id) ? 1 : 0.25;
}

function chordMoveTooltip(event) {
  const canvas = document.getElementById('main-canvas').getBoundingClientRect();
  const tt = document.getElementById('tooltip');
  tt.style.left = (event.clientX - canvas.left + 12) + 'px';
  tt.style.top  = (event.clientY - canvas.top  + 12) + 'px';
}
