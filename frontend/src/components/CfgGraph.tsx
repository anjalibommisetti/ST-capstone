import React, { useState, useMemo } from 'react';
import { CfgNode, CfgEdge } from '../api/types';
import { GitFork, Check, ArrowRight, Code, Sparkles, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface CfgGraphProps {
  nodes: CfgNode[];
  edges: CfgEdge[];
  highlightedNodeIds?: string[];
  onSelectNode?: (node: CfgNode) => void;
}

export const CfgGraph: React.FC<CfgGraphProps> = ({
  nodes,
  edges,
  highlightedNodeIds = [],
  onSelectNode,
}) => {
  const [selectedNode, setSelectedNode] = useState<CfgNode | null>(nodes[0] || null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Compute a layout for nodes (Hierarchical/flow layout)
  const layout = useMemo(() => {
    const nodeMap = new Map<string, { node: CfgNode; x: number; y: number }>();
    const startY = 50;
    const verticalGap = 90;
    const canvasWidth = 850;
    const centerX = canvasWidth / 2;

    // Arrange nodes sequentially or layered
    nodes.forEach((node, index) => {
      let x = centerX;
      const y = startY + index * verticalGap;

      // Adjust X based on node type / branch
      if (node.type === 'DECISION') {
        x = centerX - 60;
      } else if (node.type === 'STATEMENT') {
        // If connected from a decision true branch, shift right
        const incomingEdge = edges.find((e) => e.toNodeId === node.id);
        if (incomingEdge && incomingEdge.label.toLowerCase() === 'true') {
          x = centerX + 180;
        } else if (incomingEdge && incomingEdge.label.toLowerCase() === 'false') {
          x = centerX - 180;
        } else {
          x = centerX;
        }
      } else if (node.type === 'ENTRY' || node.type === 'EXIT') {
        x = centerX;
      }

      nodeMap.set(node.id, { node, x, y });
    });

    return nodeMap;
  }, [nodes, edges]);

  const handleNodeClick = (node: CfgNode) => {
    setSelectedNode(node);
    if (onSelectNode) onSelectNode(node);
  };

  const maxY = Math.max(...Array.from(layout.values()).map((p) => p.y), 400) + 120;
  const canvasWidth = 850;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Graph Visualizer Panel */}
      <div className="flex-1 bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden flex flex-col relative shadow-xl">
        {/* Controls Toolbar */}
        <div className="h-12 border-b border-slate-800 bg-slate-900/60 px-4 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <GitFork className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-200">Interactive Control Flow Graph</span>
            <span className="text-slate-500">({nodes.length} nodes, {edges.length} edges)</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-300 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] text-slate-400">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-300 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-300 transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* SVG Canvas */}
        <div className="overflow-auto max-h-[640px] p-6 flex justify-center bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
          <svg
            width={canvasWidth * zoomLevel}
            height={maxY * zoomLevel}
            viewBox={`0 0 ${canvasWidth} ${maxY}`}
            className="transition-transform duration-150"
          >
            <defs>
              <marker
                id="arrow-next"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#64748b" />
              </marker>
              <marker
                id="arrow-true"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#10b981" />
              </marker>
              <marker
                id="arrow-false"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#f43f5e" />
              </marker>
              <marker
                id="arrow-return"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#818cf8" />
              </marker>
              <marker
                id="arrow-highlight"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#38bdf8" />
              </marker>
            </defs>

            {/* Render Directed Edges */}
            {edges.map((edge) => {
              const fromPos = layout.get(edge.fromNodeId);
              const toPos = layout.get(edge.toNodeId);
              if (!fromPos || !toPos) return null;

              const isHighlighted =
                highlightedNodeIds.includes(edge.fromNodeId) &&
                highlightedNodeIds.includes(edge.toNodeId);

              const isTrue = edge.label.toLowerCase() === 'true';
              const isFalse = edge.label.toLowerCase() === 'false';
              const isReturn = edge.label.toLowerCase() === 'return';

              let strokeColor = '#475569';
              let marker = 'url(#arrow-next)';
              if (isHighlighted) {
                strokeColor = '#38bdf8';
                marker = 'url(#arrow-highlight)';
              } else if (isTrue) {
                strokeColor = '#10b981';
                marker = 'url(#arrow-true)';
              } else if (isFalse) {
                strokeColor = '#f43f5e';
                marker = 'url(#arrow-false)';
              } else if (isReturn) {
                strokeColor = '#818cf8';
                marker = 'url(#arrow-return)';
              }

              // Path computation
              const startX = fromPos.x;
              const startY = fromPos.y + 24;
              const endX = toPos.x;
              const endY = toPos.y - 24;

              // Curved bezier for aesthetic flow
              const midY = (startY + endY) / 2;
              const pathD = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
              const labelX = (startX + endX) / 2 + (isTrue ? 24 : isFalse ? -24 : 12);
              const labelY = midY;

              return (
                <g key={edge.id} className="transition-all">
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isHighlighted ? 3 : 2}
                    strokeDasharray={edge.label === 'loop-back' ? '5 5' : 'none'}
                    markerEnd={marker}
                  />
                  {edge.label && edge.label !== 'next' && (
                    <g transform={`translate(${labelX}, ${labelY})`}>
                      <rect
                        x="-20"
                        y="-10"
                        width="40"
                        height="18"
                        rx="4"
                        fill="#090d16"
                        stroke={strokeColor}
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="bold"
                        fill={isTrue ? '#34d399' : isFalse ? '#fb7185' : '#a5b4fc'}
                      >
                        {edge.label.toUpperCase()}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Render Nodes */}
            {Array.from(layout.values()).map(({ node, x, y }) => {
              const isSelected = selectedNode?.id === node.id;
              const isHighlighted = highlightedNodeIds.includes(node.id);

              let nodeWidth = 200;
              let nodeHeight = 44;
              let bg = '#1e293b';
              let border = '#334155';
              let badgeBg = '#334155';
              let badgeText = '#94a3b8';

              if (node.type === 'ENTRY') {
                bg = '#064e3b';
                border = '#059669';
                badgeBg = '#047857';
                badgeText = '#a7f3d0';
                nodeWidth = 180;
              } else if (node.type === 'EXIT') {
                bg = '#4c1d95';
                border = '#7c3aed';
                badgeBg = '#6d28d9';
                badgeText = '#ddd6fe';
                nodeWidth = 180;
              } else if (node.type === 'DECISION') {
                bg = '#451a03';
                border = '#d97706';
                badgeBg = '#b45309';
                badgeText = '#fde68a';
                nodeWidth = 220;
              } else if (node.type === 'LOOP') {
                bg = '#0c4a6e';
                border = '#0284c7';
                badgeBg = '#0369a1';
                badgeText = '#bae6fd';
                nodeWidth = 220;
              }

              if (isHighlighted) {
                border = '#38bdf8';
                bg = '#0f2942';
              }
              if (isSelected) {
                border = '#6366f1';
              }

              return (
                <g
                  key={node.id}
                  transform={`translate(${x - nodeWidth / 2}, ${y - nodeHeight / 2})`}
                  onClick={() => handleNodeClick(node)}
                  className="cursor-pointer group select-none"
                >
                  {/* Outer selection ring */}
                  {(isSelected || isHighlighted) && (
                    <rect
                      x="-4"
                      y="-4"
                      width={nodeWidth + 8}
                      height={nodeHeight + 8}
                      rx="12"
                      fill="none"
                      stroke={isSelected ? '#6366f1' : '#38bdf8'}
                      strokeWidth="2"
                      className="animate-pulse"
                    />
                  )}

                  {/* Main Node Box */}
                  <rect
                    x="0"
                    y="0"
                    width={nodeWidth}
                    height={nodeHeight}
                    rx="8"
                    fill={bg}
                    stroke={border}
                    strokeWidth="1.5"
                    className="transition-colors group-hover:brightness-110"
                  />

                  {/* Node ID badge */}
                  <rect x="6" y="6" width="34" height="18" rx="4" fill={badgeBg} />
                  <text
                    x="23"
                    y="19"
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="bold"
                    fill={badgeText}
                    fontFamily="monospace"
                  >
                    {node.id}
                  </text>

                  {/* Line Number Badge */}
                  {node.lineNumber > 0 && (
                    <text
                      x={nodeWidth - 8}
                      y="19"
                      textAnchor="end"
                      fontSize="9"
                      fill="#94a3b8"
                      fontFamily="monospace"
                    >
                      L{node.lineNumber}
                    </text>
                  )}

                  {/* Label */}
                  <text
                    x={node.lineNumber > 0 ? "46" : "46"}
                    y="20"
                    fontSize="11"
                    fontWeight="600"
                    fill="#f1f5f9"
                    clipPath={`url(#clip-${node.id})`}
                  >
                    {node.label.length > 20 ? node.label.substring(0, 19) + '...' : node.label}
                  </text>

                  {/* Snippet preview */}
                  <text
                    x="10"
                    y="36"
                    fontSize="9"
                    fill="#94a3b8"
                    fontFamily="monospace"
                  >
                    {node.codeSnippet.length > 30 ? node.codeSnippet.substring(0, 28) + '..' : node.codeSnippet}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Selected Node Details Card */}
      <div className="w-full lg:w-80 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-4 h-4" />
            <span>Node Inspector</span>
          </div>

          {selectedNode ? (
            <div className="space-y-4">
              <div>
                <div className="text-xl font-bold text-white flex items-center space-x-2">
                  <span className="font-mono text-indigo-400">{selectedNode.id}</span>
                  <span className="text-xs px-2 py-0.5 rounded font-mono font-medium bg-slate-800 text-slate-300">
                    {selectedNode.type}
                  </span>
                </div>
                <div className="text-sm font-semibold text-slate-200 mt-1">{selectedNode.label}</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Line Number:</span>
                  <span className="font-mono text-white font-semibold">
                    {selectedNode.lineNumber > 0 ? `Line ${selectedNode.lineNumber}` : 'Synthetic/Method Head'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Node Category:</span>
                  <span className="capitalize text-slate-300">{selectedNode.type.toLowerCase()}</span>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                  <Code className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Code Snippet</span>
                </div>
                <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {selectedNode.codeSnippet || '// No code snippet'}
                </pre>
              </div>

              {/* Connected Edges */}
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Outbound Branches
                </div>
                <div className="space-y-1.5">
                  {edges
                    .filter((e) => e.fromNodeId === selectedNode.id)
                    .map((edge) => (
                      <div
                        key={edge.id}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-slate-300">{edge.fromNodeId}</span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                          <span className="font-mono font-bold text-indigo-300">{edge.toNodeId}</span>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          edge.label.toLowerCase() === 'true'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : edge.label.toLowerCase() === 'false'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {edge.label.toUpperCase()}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Click on any node in the graph above to inspect its AST properties and branch transitions.
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400">
          Tip: Basis independent paths represent linearly independent traversals used to achieve 100% branch and decision coverage.
        </div>
      </div>
    </div>
  );
};
