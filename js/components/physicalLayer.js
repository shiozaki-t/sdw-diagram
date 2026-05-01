// Physical layer — material flow as a circular lifecycle
function buildPhysicalLayer(g, width, height, activeStakeholders) {
  g.selectAll('.physical-layer').remove();
  const layer = g.append('g').attr('class', 'physical-layer');
  const hasFilter = activeStakeholders.size > 0;

  const cx    = width / 2;
  const cy    = height / 2;
  const orbitR = Math.min(width, height) * 0.30;
  const nodeR  = 32;
  const n      = PHASES.length;

  // Phase positions — clockwise from top
  const phasePos = PHASES.map((p, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    return { ...p, cx: cx + Math.cos(angle) * orbitR, cy: cy + Math.sin(angle) * orbitR, angle };
  });

  function phaseIdx(id) { return PHASES.findIndex(p => p.id === id); }

  // Control point outward from orbit center
  function outerCtrl(src, tgt) {
    const midX = (src.cx + tgt.cx) / 2;
    const midY = (src.cy + tgt.cy) / 2;
    const dx = midX - cx, dy = midY - cy;
    const d = Math.sqrt(dx * dx + dy * dy) || 1;
    return { x: midX + (dx / d) * 28, y: midY + (dy / d) * 28 };
  }

  // Control point toward orbit center
  function innerCtrl(src, tgt) {
    const midX = (src.cx + tgt.cx) / 2;
    const midY = (src.cy + tgt.cy) / 2;
    const dx = cx - midX, dy = cy - midY;
    const d = Math.sqrt(dx * dx + dy * dy) || 1;
    return { x: midX + (dx / d) * 55, y: midY + (dy / d) * 55 };
  }

  // Edge-to-edge path
  function edgePath(src, tgt, ctrl) {
    const dx = tgt.cx - src.cx, dy = tgt.cy - src.cy;
    const d  = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / d, uy = dy / d;
    const x1 = src.cx + ux * nodeR;
    const y1 = src.cy + uy * nodeR;
    const x2 = tgt.cx - ux * nodeR;
    const y2 = tgt.cy - uy * nodeR;
    return `M${x1},${y1} Q${ctrl.x},${ctrl.y} ${x2},${y2}`;
  }

  // Arrow marker (red)
  const svgEl = d3.select(g.node().ownerSVGElement);
  let defs = svgEl.select('defs');
  if (defs.empty()) defs = svgEl.append('defs');
  defs.select('#arr-phys').remove();
  defs.append('marker')
    .attr('id', 'arr-phys').attr('viewBox', '0 -4 9 8')
    .attr('refX', 7).attr('refY', 0)
    .attr('markerWidth', 5).attr('markerHeight', 5).attr('orient', 'auto')
    .append('path').attr('d', 'M0,-4L9,0L0,4').attr('fill', '#C61B1A');

  // Draw orbit guide ring (very faint)
  layer.append('circle')
    .attr('cx', cx).attr('cy', cy).attr('r', orbitR)
    .attr('fill', 'none').attr('stroke', '#C4BFB5').attr('stroke-width', 1);

  // Material connections
  PHASE_CONNECTIONS.filter(c => c.type === 'material').forEach(conn => {
    const src = phasePos.find(p => p.id === conn.source);
    const tgt = phasePos.find(p => p.id === conn.target);
    if (!src || !tgt) return;

    const si = phaseIdx(conn.source), ti = phaseIdx(conn.target);
    const isActive = !hasFilter || connIsActive(conn);
    // inner arc: backward or skip
    const isInner = si > ti || (ti - si) > 1;
    const ctrl = isInner ? innerCtrl(src, tgt) : outerCtrl(src, tgt);

    layer.append('path')
      .attr('d', edgePath(src, tgt, ctrl))
      .attr('fill', 'none')
      .attr('stroke', '#C61B1A')
      .attr('stroke-width', isInner ? 1.2 : 2)
      .attr('opacity', isActive ? 0.85 : 0.06)
      .attr('marker-end', 'url(#arr-phys)');

    // Material label at quadratic bezier midpoint (outer arcs only)
    if (!isInner && isActive) {
      const dx2 = tgt.cx - src.cx, dy2 = tgt.cy - src.cy;
      const d2  = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 1;
      const x1l = src.cx + (dx2 / d2) * nodeR;
      const y1l = src.cy + (dy2 / d2) * nodeR;
      const x2l = tgt.cx - (dx2 / d2) * nodeR;
      const y2l = tgt.cy - (dy2 / d2) * nodeR;
      const mx = 0.25 * x1l + 0.5 * ctrl.x + 0.25 * x2l;
      const my = 0.25 * y1l + 0.5 * ctrl.y + 0.25 * y2l;
      layer.append('text')
        .attr('x', mx).attr('y', my - 7)
        .attr('text-anchor', 'middle')
        .attr('fill', '#C61B1A').attr('font-size', 8).attr('letter-spacing', '0.06em')
        .attr('opacity', 0.65).text(conn.label);
    }
  });

  // Phase circles
  phasePos.forEach(p => {
    const active = !hasFilter || phaseIsActive(p.id);
    const selected = selectedPhase === p.id;

    const gr = layer.append('g')
      .attr('transform', `translate(${p.cx},${p.cy})`)
      .style('cursor', 'pointer')
      .on('click', () => selectPhase(p.id))
      .on('mouseenter', ev => showTooltip(ev, p))
      .on('mouseleave', hideTooltip);

    gr.append('circle').attr('r', nodeR)
      .attr('fill', selected ? '#C61B1A' : '#FFFFFF')
      .attr('stroke', active ? (selected ? '#C61B1A' : p.color) : '#C4BFB5')
      .attr('stroke-width', selected ? 0 : 1.8)
      .attr('opacity', active ? 1 : 0.25);

    gr.append('text')
      .attr('y', 0).attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('font-size', 17).attr('pointer-events', 'none')
      .attr('opacity', active ? 1 : 0.15)
      .text(p.icon);

    // Labels outside the circle
    const lx = Math.cos(p.angle) * (nodeR + 13);
    const ly = Math.sin(p.angle) * (nodeR + 13);
    const lx2 = Math.cos(p.angle) * (nodeR + 25);
    const ly2 = Math.sin(p.angle) * (nodeR + 25);
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
      .attr('opacity', active ? 0.8 : 0.1)
      .text(p.labelEn.toUpperCase());
  });

  // Layer label
  layer.append('text')
    .attr('x', 16).attr('y', 22)
    .attr('fill', '#C61B1A').attr('font-size', 8.5).attr('font-weight', 700)
    .attr('letter-spacing', '0.22em').text('PHYSICAL LAYER');
}
