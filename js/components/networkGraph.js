// D3 force-simulation network for overview mode
function buildOverviewGraph(svg, width, height, activeStakeholders) {
  svg.selectAll('.overview-layer').remove();
  const layer = svg.append('g').attr('class', 'overview-layer');

  const hasFilter = activeStakeholders.size > 0;

  // build nodes from stakeholders
  const nodes = STAKEHOLDERS.map(s => ({
    ...s,
    active: !hasFilter || activeStakeholders.has(s.id)
  }));

  // build links from STAKEHOLDER_CONNECTIONS
  const links = STAKEHOLDER_CONNECTIONS.map(c => ({
    ...c,
    sourceObj: nodes.find(n => n.id === c.source),
    targetObj: nodes.find(n => n.id === c.target),
    active: !hasFilter || (
      (activeStakeholders.has(c.source) || activeStakeholders.has(c.target))
    )
  }));

  const sim = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(80).strength(0.4))
    .force('charge', d3.forceManyBody().strength(-200))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide(32));

  const link = layer.append('g').selectAll('line')
    .data(links).join('line')
    .attr('stroke', d => d.active ? '#3E9E6B' : '#B0D4BE')
    .attr('stroke-width', d => d.active ? 2 : 0.5)
    .attr('opacity', d => d.active ? 0.7 : 0.25);

  const node = layer.append('g').selectAll('g')
    .data(nodes).join('g')
    .attr('class', 'sth-node')
    .call(d3.drag()
      .on('start', (event, d) => { if (!event.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on('drag',  (event, d) => { d.fx = event.x; d.fy = event.y; })
      .on('end',   (event, d) => { if (!event.active) sim.alphaTarget(0); d.fx = null; d.fy = null; })
    );

  node.append('circle')
    .attr('r', d => d.active ? 18 : 12)
    .attr('fill', d => d.active ? d.color : '#D8EEE3')
    .attr('stroke', d => d.active ? d.color : '#B0D4BE')
    .attr('stroke-width', 1.5)
    .attr('opacity', d => d.active ? 1 : 0.45);

  node.append('text')
    .text(d => d.label)
    .attr('text-anchor', 'middle')
    .attr('dy', 30)
    .attr('fill', d => d.active ? '#1A1816' : '#78746D')
    .attr('font-size', 10)
    .attr('pointer-events', 'none');

  sim.on('tick', () => {
    link
      .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    node.attr('transform', d => `translate(${d.x},${d.y})`);
  });

  return sim;
}
