import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { SipDialog, SipMessage } from '../types';
import { useAnalysisStore } from '../store/useAnalysisStore';


interface LadderDiagramProps {

  dialog: SipDialog;
}

export const LadderDiagram: React.FC<LadderDiagramProps> = ({ dialog }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { setSelectedMessage } = useAnalysisStore();

  useEffect(() => {

    if (!svgRef.current || !dialog) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 800;
    const padding = 60;
    const messageHeight = 50;
    const height = (dialog.messages.length + 1) * messageHeight + padding * 2;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Extract unique endpoints
    const endpoints = Array.from(new Set(
      dialog.messages.flatMap(m => [m.srcIp, m.dstIp])
    ));

    const xScale = d3.scalePoint()
      .domain(endpoints)
      .range([padding * 2, width - padding * 2]);

    // Draw Swimlanes
    endpoints.forEach(ip => {
      const x = xScale(ip) || 0;
      
      // Vertical line
      svg.append('line')
        .attr('x1', x)
        .attr('y1', padding)
        .attr('x2', x)
        .attr('y2', height - padding)
        .attr('stroke', 'rgba(255, 255, 255, 0.1)')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4 4');

      // Label
      svg.append('rect')
        .attr('x', x - 60)
        .attr('y', 10)
        .attr('width', 120)
        .attr('height', 30)
        .attr('rx', 15)
        .attr('fill', 'var(--bg-surface-elevated)')
        .attr('stroke', 'var(--border-accent)');

      svg.append('text')
        .attr('x', x)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--text-primary)')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text(ip);
    });

    // Draw Message Arrows
    dialog.messages.forEach((msg, i) => {
      const y = padding + (i + 1) * messageHeight;
      const xSrc = xScale(msg.srcIp) || 0;
      const xDst = xScale(msg.dstIp) || 0;

      const isRight = xDst > xSrc;
      const color = msg.code ? (msg.code >= 200 && msg.code < 300 ? 'var(--sip-success)' : 'var(--sip-error)') : 'var(--sip-invite)';

      // Arrow path
      const arrowBody = svg.append('path')
        .attr('d', `M ${xSrc} ${y} L ${xDst} ${y}`)
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('marker-end', `url(#arrowhead-${i})`)
        .attr('class', 'message-arrow')
        .style('cursor', 'pointer')
        .on('click', () => setSelectedMessage(msg));

      // Invisible hit area for easier clicking
      svg.append('path')
        .attr('d', `M ${xSrc} ${y} L ${xDst} ${y}`)
        .attr('stroke', 'transparent')
        .attr('stroke-width', 20)
        .style('cursor', 'pointer')
        .on('click', () => setSelectedMessage(msg));


      // Arrowhead marker
      svg.append('defs').append('marker')
        .attr('id', `arrowhead-${i}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 10)
        .attr('refY', 0)
        .attr('orient', 'auto')
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', color);

      // Label
      svg.append('text')
        .attr('x', (xSrc + xDst) / 2)
        .attr('y', y - 8)
        .attr('text-anchor', 'middle')
        .attr('fill', color)
        .attr('font-size', '11px')
        .attr('font-weight', '500')
        .style('cursor', 'pointer')
        .text(`${msg.method}${msg.code ? ' ' + msg.code : ''}`)
        .on('click', () => setSelectedMessage(msg));


      // Timestamp
      svg.append('text')
        .attr('x', isRight ? xSrc - 10 : xSrc + 10)
        .attr('y', y + 4)
        .attr('text-anchor', isRight ? 'end' : 'start')
        .attr('fill', 'var(--text-muted)')
        .attr('font-size', '9px')
        .text(`${(msg.timestamp % 1000).toFixed(0)}ms`);
    });

  }, [dialog]);

  return (
    <div className="w-full h-full overflow-auto p-4 bg-[#0a0c10]">
      <svg 
        ref={svgRef} 
        className="w-full"
        style={{ minHeight: '100%' }}
      />
    </div>
  );
};
