// Information layer — existing info flows + SDW potential connections (circular)
function buildInfoLayer(g, width, height, activeStakeholders) {
  g.selectAll('.info-layer').remove();
  const layer = g.append('g').attr('class', 'info-layer');
  const hasFilter = activeStakeholders.size > 0;

  const cx    = width / 2;
  const cy    = height / 2;
  const orbitR = Math.min(width, height) * 0.30;
  const nodeR  = 32;
  const n      = PHASES.length;

  // Phase positions — same circle as physical layer
  const phasePos = PHASES.map((p, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    return { ...p, cx: cx + Math.cos(angle) * orbitR, cy: cy + Math.sin(angle) * orbitR, angle };
  });

  // Arrow markers
  const svgEl = d3.select(g.node().ownerSVGElement);
  let defs = svgEl.select('defs');
  if (defs.empty()) defs = svgEl.append('defs');
  ['arr-info', 'arr-sdw'].forEach(id => defs.select('#' + id).remove());

  defs.append('marker')
    .attr('id', 'arr-info').attr('viewBox', '0 -4 9 8')
    .attr('refX', 7).attr('markerWidth', 5).attr('markerHeight', 5).attr('orient', 'auto')
    .append('path').attr('d', 'M0,-4L9,0L0,4').attr('fill', '#2E6BA8');

  defs.append('marker')
    .attr('id', 'arr-sdw').attr('viewBox', '0 -4 9 8')
    .attr('refX', 7).attr('markerWidth', 5).attr('markerHeight', 5).attr('orient', 'auto')
    .append('path').attr('d', 'M0,-4L9,0L0,4').attr('fill', '#4A8AAD').attr('opacity', 0.9);

  // Inner chord: arc curving toward orbit center
  // factor = how far toward center (0 = midpoint of chord, 1 = orbit center)
  function chord(src, tgt, factor) {
    const dx = tgt.cx - src.cx, dy = tgt.cy - src.cy;
    const d  = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / d, uy = dy / d;
    const x1 = src.cx + ux * nodeR;
    const y1 = src.cy + uy * nodeR;
    const x2 = tgt.cx - ux * nodeR;
    const y2 = tgt.cy - uy * nodeR;

    const midX = (src.cx + tgt.cx) / 2;
    const midY = (src.cy + tgt.cy) / 2;
    const toCX = cx - midX, toCY = cy - midY;
    const toCLen = Math.sqrt(toCX * toCX + toCY * toCY) || 1;
    const ctrlX = midX + (toCX / toCLen) * (toCLen * factor);
    const ctrlY = midY + (toCY / toCLen) * (toCLen * factor);

    // midpoint of quadratic bezier for label placement
    const lx = 0.25 * x1 + 0.5 * ctrlX + 0.25 * x2;
    const ly = 0.25 * y1 + 0.5 * ctrlY + 0.25 * y2;

    return { path: `M${x1},${y1} Q${ctrlX},${ctrlY} ${x2},${y2}`, lx, ly };
  }

  // Orbit guide
  layer.append('circle')
    .attr('cx', cx).attr('cy', cy).attr('r', orbitR)
    .attr('fill', 'none').attr('stroke', '#C4BFB5').attr('stroke-width', 1);

  // Existing info connections — solid, white/light blue, inner chords
  PHASE_CONNECTIONS.filter(c => c.type === 'info').forEach(conn => {
    const src = phasePos.find(p => p.id === conn.source);
    const tgt = phasePos.find(p => p.id === conn.target);
    if (!src || !tgt) return;
    const isActive = !hasFilter || connIsActive(conn);
    const { path, lx, ly } = chord(src, tgt, 0.5);

    layer.append('path').attr('d', path)
      .attr('fill', 'none').attr('stroke', '#2E6BA8')
      .attr('stroke-width', 1.6).attr('opacity', isActive ? 0.72 : 0.08)
      .attr('marker-end', 'url(#arr-info)');

    layer.append('text')
      .attr('x', lx).attr('y', ly)
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
      .attr('fill', '#2E6BA8').attr('font-size', 8).attr('letter-spacing', '0.05em')
      .attr('opacity', isActive ? 0.8 : 0.06)
      .text(conn.label);
  });

  // SDW potential connections — dashed, dim blue-gray, inner chords
  POTENTIAL_INFO_CONNECTIONS.forEach(conn => {
    const src = phasePos.find(p => p.id === conn.source);
    const tgt = phasePos.find(p => p.id === conn.target);
    if (!src || !tgt) return;
    const isActive = !hasFilter || connIsActive(conn);
    const { path, lx, ly } = chord(src, tgt, 0.45);

    layer.append('path').attr('d', path)
      .attr('fill', 'none').attr('stroke', '#4A8AAD')
      .attr('stroke-width', 1.2).attr('stroke-dasharray', '5 4')
      .attr('opacity', isActive ? 0.65 : 0.06)
      .attr('marker-end', 'url(#arr-sdw)');

    layer.append('text')
      .attr('x', lx).attr('y', ly)
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
      .attr('fill', '#4A8AAD').attr('font-size', 8).attr('letter-spacing', '0.05em')
      .attr('opacity', isActive ? 0.75 : 0.06)
      .text(conn.label);
  });

  // Phase circles — info/digital styling
  phasePos.forEach(p => {
    const active = !hasFilter || phaseIsActive(p.id);
    const selected = selectedPhase === p.id;

    const gr = layer.append('g')
      .attr('transform', `translate(${p.cx},${p.cy})`)
      .style('cursor', 'pointer')
      .on('click', () => selectPhase(p.id))
      .on('mouseenter', ev => showTooltip(ev, p))
      .on('mouseleave', hideTooltip);

    // Dashed outer ring — "digital node" feel
    gr.append('circle').attr('r', nodeR + 7)
      .attr('fill', 'none').attr('stroke', '#2E6BA8')
      .attr('stroke-width', 0.5).attr('stroke-dasharray', '3 4')
      .attr('opacity', active ? 0.25 : 0.04);

    gr.append('circle').attr('r', nodeR)
      .attr('fill', selected ? '#E6F0F8' : '#F4F8FB')
      .attr('stroke', active ? '#2E6BA8' : '#D8E4EC')
      .attr('stroke-width', selected ? 2 : 1)
      .attr('opacity', active ? 1 : 0.25);

    gr.append('text')
      .attr('y', 0).attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('font-size', 16).attr('pointer-events', 'none')
      .attr('opacity', active ? 0.65 : 0.1)
      .text(p.icon);

    const lx     = Math.cos(p.angle) * (nodeR + 14);
    const ly     = Math.sin(p.angle) * (nodeR + 14);
    const lx2    = Math.cos(p.angle) * (nodeR + 26);
    const ly2    = Math.sin(p.angle) * (nodeR + 26);
    const anchor = Math.cos(p.angle) > 0.15 ? 'start' : (Math.cos(p.angle) < -0.15 ? 'end' : 'middle');

    gr.append('text')
      .attr('x', lx).attr('y', ly + 4)
      .attr('text-anchor', anchor)
      .attr('fill', active ? '#1A1816' : '#C4BFB5')
      .attr('font-size', 10).attr('font-weight', selected ? 700 : 400)
      .attr('letter-spacing', '0.03em').attr('pointer-events', 'none')
      .attr('opacity', active ? 1 : 0.2)
      .text(p.label);

    gr.append('text')
      .attr('x', lx2).attr('y', ly2 + 4)
      .attr('text-anchor', anchor)
      .attr('fill', '#78746D').attr('font-size', 7.5)
      .attr('letter-spacing', '0.1em').attr('pointer-events', 'none')
      .attr('opacity', active ? 0.7 : 0.08)
      .text(p.labelEn.toUpperCase());
  });

  // Legend
  const lg = layer.append('g').attr('transform', 'translate(16,12)');
  lg.append('rect').attr('width', 186).attr('height', 55)
    .attr('fill', '#F6F4EF').attr('stroke', '#C4BFB5').attr('opacity', 0.96);

  lg.append('text').attr('x', 10).attr('y', 16)
    .attr('fill', '#2E6BA8').attr('font-size', 7.5).attr('font-weight', 700)
    .attr('letter-spacing', '0.22em').text('INFORMATION LAYER');

  lg.append('line').attr('x1', 10).attr('y1', 30).attr('x2', 42).attr('y2', 30)
    .attr('stroke', '#2E6BA8').attr('stroke-width', 1.6);
  lg.append('text').attr('x', 48).attr('y', 34)
    .attr('fill', '#1A1816').attr('font-size', 8.5).text('既存の情報フロー');

  lg.append('line').attr('x1', 10).attr('y1', 46).attr('x2', 42).attr('y2', 46)
    .attr('stroke', '#4A8AAD').attr('stroke-width', 1.2).attr('stroke-dasharray', '5 4');
  lg.append('text').attr('x', 48).attr('y', 50)
    .attr('fill', '#78746D').attr('font-size', 8.5).text('SDW 潜在的接続');

  // Layer label
  layer.append('text')
    .attr('x', width - 16).attr('y', 22)
    .attr('text-anchor', 'end')
    .attr('fill', '#2E6BA8').attr('font-size', 8.5).attr('font-weight', 700)
    .attr('letter-spacing', '0.22em').text('INFORMATION LAYER — SDW');
}
