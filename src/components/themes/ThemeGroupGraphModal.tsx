import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import ReactFlow, {
  type Node,
  type Edge,
  Background,
  Controls,
  MiniMap,
  Position,
  type NodeProps,
  MarkerType,
  Handle,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { GET_THEME_GROUP_WITH_EXTRACTS } from '../../lib/graphql/queries';
import { CloseCircle } from 'iconsax-react';
import { useTheme } from '../../context/theme-context';
import { cn } from '../../lib/utils';

interface Character {
  malId: number;
  name: string;
  image?: string;
}

interface Theme {
  id: string;
  name: string;
  color: string;
  extractCount: number;
}

interface ThemeGroup {
  id: string;
  name: string;
  color: string;
  themes: Theme[];
  extractCount: number;
}

interface Extract {
  id: string;
  text: string;
  animeTitle: string;
  animeImage?: string;
  episode?: number;
  characters: Character[];
  theme?: {
    id: string;
    name: string;
    color: string;
  };
}

interface Props {
  themeGroup: ThemeGroup;
  isOpen: boolean;
  onClose: () => void;
}

// Custom node for Theme Group
const ThemeGroupNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div
        className="px-6 py-4 rounded-lg shadow-2xl border-4 border-white"
        style={{
          backgroundColor: data.color,
          minWidth: '200px',
        }}
      >
        <div className="text-center">
          <div className="font-bold text-white text-lg mb-1">{data.label}</div>
          <div className="text-white text-xs opacity-90">{data.count} extraits</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </>
  );
};

// Custom node for Mini-Theme
const MiniThemeNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div
        className="px-5 py-3 rounded-lg shadow-lg border-4 border-white"
        style={{
          backgroundColor: data.color,
          minWidth: '160px',
        }}
      >
        <div className="text-center">
          <div className="font-semibold text-white text-base mb-1">{data.label}</div>
          <div className="text-white text-xs opacity-90">{data.count} extraits</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </>
  );
};

// Custom node for Extract with tooltip
const ExtractNode: React.FC<NodeProps> = ({ data }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const isSelected = data.isSelected;
  const shouldShowTooltip = showTooltip || isSelected;

  const handleClick = () => {
    if (data.onExtractClick && data.extractId) {
      data.onExtractClick(data.extractId);
    }
  };

  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={handleClick}
        className={`bg-white rounded-lg shadow-md border-2 hover:shadow-xl transition-all cursor-pointer px-3 py-2 ${
          isSelected ? 'border-yellow-400 ring-2 ring-yellow-300' : 'border-gray-300'
        }`}
        style={{
          minWidth: '140px',
        }}
      >
        <div className="text-xs font-medium text-gray-900 text-center truncate mb-1">
          {data.animeTitle}
        </div>
        {data.episode && (
          <div className="text-xs text-gray-500 text-center">Ep. {data.episode}</div>
        )}
        <div className="text-xs text-gray-600 text-center mt-1 line-clamp-2">
          {data.text.substring(0, 50)}...
        </div>
      </div>

      {/* Tooltip */}
      {shouldShowTooltip && (
        <div
          className={`absolute z-50 bg-white rounded-xl shadow-2xl border-2 p-4 ${
            isSelected ? 'border-yellow-400 pointer-events-auto' : 'border-gray-300 pointer-events-none'
          }`}
          style={{
            left: '160px',
            top: '-50%',
            width: '320px',
            maxHeight: '400px',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {/* Anime Info */}
          <div className="flex gap-3 mb-3 pb-3 border-b border-gray-200">
            {data.animeImage && (
              <img
                src={data.animeImage}
                alt={data.animeTitle}
                className="w-16 h-24 object-cover rounded-lg flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-bold text-gray-900 text-sm mb-1">{data.animeTitle}</div>
              {data.episode && (
                <div className="text-xs text-gray-600">Épisode {data.episode}</div>
              )}
              {data.theme && (
                <div
                  className="inline-block mt-1 px-2 py-1 rounded text-xs font-medium text-white"
                  style={{ backgroundColor: data.theme.color }}
                >
                  {data.theme.name}
                </div>
              )}
            </div>
          </div>

          {/* Extract Text */}
          <div className="mb-3">
            <div className="text-xs font-semibold text-gray-700 mb-1">Extrait :</div>
            <div className="text-xs text-gray-900 italic bg-gray-50 p-2 rounded">
              "{data.text}"
            </div>
          </div>

          {/* Characters */}
          {data.characters && data.characters.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-700 mb-2">Personnages :</div>
              <div className="space-y-2">
                {data.characters.map((char: Character) => (
                  <div key={char.malId} className="flex items-center gap-2">
                    {char.image && (
                      <img
                        src={char.image}
                        alt={char.name}
                        className="w-8 h-8 rounded-full object-cover border border-gray-300 flex-shrink-0"
                      />
                    )}
                    <span className="text-xs text-gray-900 font-medium">{char.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  themeGroup: ThemeGroupNode,
  miniTheme: MiniThemeNode,
  extract: ExtractNode,
};

const ThemeGroupGraphModal: React.FC<Props> = ({ themeGroup, isOpen, onClose }) => {
  const { theme } = useTheme();
  const [selectedExtractId, setSelectedExtractId] = useState<string | null>(null);
  const modalRef = React.useRef<HTMLDivElement>(null);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Handle click outside to close modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const { data, loading } = useQuery(GET_THEME_GROUP_WITH_EXTRACTS, {
    variables: { id: themeGroup.id },
    skip: !isOpen,
  });

  const handleExtractClick = useCallback((extractId: string) => {
    setSelectedExtractId((prev) => (prev === extractId ? null : extractId));
  }, []);

  const { nodes, edges } = useMemo(() => {
    if (!data) return { nodes: [], edges: [] };

    const allExtracts: Extract[] = data.extracts || [];
    const group: ThemeGroup = data.themeGroup;

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Root node - Theme Group
    nodes.push({
      id: `group-${group.id}`,
      type: 'themeGroup',
      data: {
        label: group.name,
        count: group.extractCount,
        color: group.color,
      },
      position: { x: 500, y: 50 },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    });

    // Mini-themes nodes (level 2)
    const themesInGroup = group.themes || [];
    const themeSpacing = 500;
    const totalWidth = themesInGroup.length * themeSpacing;
    const startX = 500 - totalWidth / 2 + themeSpacing / 2;

    themesInGroup.forEach((theme, themeIndex) => {
      const themeNodeId = `theme-${theme.id}`;
      const themeX = startX + themeIndex * themeSpacing;
      const themeY = 250;

      // Mini-theme node
      nodes.push({
        id: themeNodeId,
        type: 'miniTheme',
        data: {
          label: theme.name,
          count: theme.extractCount,
          color: theme.color,
        },
        position: { x: themeX, y: themeY },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      });

      // Edge from group to mini-theme
      edges.push({
        id: `edge-group-${theme.id}`,
        source: `group-${group.id}`,
        target: themeNodeId,
        type: 'default',
        animated: true,
        style: {
          stroke: theme.color,
          strokeWidth: 3,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: theme.color,
          width: 20,
          height: 20,
        },
      });

      // Extract nodes for this theme (level 3)
      const themeExtracts = allExtracts.filter(
        (extract) => extract.theme?.id === theme.id
      );

      themeExtracts.forEach((extract, extractIndex) => {
        const extractNodeId = `extract-${extract.id}`;
        const extractsPerRow = 3;
        const row = Math.floor(extractIndex / extractsPerRow);
        const col = extractIndex % extractsPerRow;
        const extractX = themeX - 300 + col * 300;
        const extractY = themeY + 200 + row * 180;

        // Extract node
        nodes.push({
          id: extractNodeId,
          type: 'extract',
          data: {
            text: extract.text,
            animeTitle: extract.animeTitle,
            animeImage: extract.animeImage,
            episode: extract.episode,
            characters: extract.characters,
            theme: extract.theme,
            extractId: extract.id,
            onExtractClick: handleExtractClick,
            isSelected: selectedExtractId === extract.id,
          },
          position: { x: extractX, y: extractY },
          targetPosition: Position.Top,
          sourcePosition: Position.Bottom,
        });

        // Edge from mini-theme to extract
        edges.push({
          id: `edge-theme-${extract.id}`,
          source: themeNodeId,
          target: extractNodeId,
          type: 'default',
          animated: false,
          style: {
            stroke: theme.color,
            strokeWidth: 2,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: theme.color,
            width: 15,
            height: 15,
          },
        });
      });
    });

    return { nodes, edges };
  }, [data, selectedExtractId, handleExtractClick]);

  if (!isOpen) return null;

  const handleClose = () => {
    setSelectedExtractId(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={cn(
          "rounded-xl shadow-2xl w-full h-[90vh] max-w-7xl flex flex-col",
          theme === "dark" ? "bg-[#12121a]" : "bg-white"
        )}
      >
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between px-6 py-4 border-b",
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        )}>
          <div>
            <h2 className={cn(
              "text-xl font-bold",
              theme === "dark" ? "text-white" : "text-gray-900"
            )}>
              Visualisation du Groupe : {themeGroup.name}
            </h2>
            <p className={cn(
              "text-sm mt-1",
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            )}>
              {themeGroup.themes.length} mini-thèmes • {themeGroup.extractCount} extraits
            </p>
          </div>
          <button
            onClick={handleClose}
            className={cn(
              "transition-colors",
              theme === "dark" ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <CloseCircle size={28} variant="Bulk" color={theme === "dark" ? "#6B7280" : "#9CA3AF"} />
          </button>
        </div>

        {/* Graph */}
        <div className={cn(
          "flex-1 relative",
          theme === "dark" ? "bg-[#0a0a0f]" : "bg-white"
        )} style={{ width: '100%', height: '100%' }}>
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={cn(
                "w-12 h-12 border-4 border-t-transparent rounded-full animate-spin",
                theme === "dark" ? "border-purple-500" : "border-indigo-600"
              )}></div>
            </div>
          ) : (
            <div style={{ width: '100%', height: '100%' }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                attributionPosition="bottom-left"
                minZoom={0.1}
                maxZoom={1.5}
                nodesDraggable={true}
                nodesConnectable={false}
                elementsSelectable={true}
                defaultEdgeOptions={{
                  type: 'default',
                  animated: false,
                }}
                proOptions={{ hideAttribution: true }}
              >
                <Background color={theme === "dark" ? "#1a1a25" : "#f3f4f6"} gap={16} />
                <Controls />
                <MiniMap
                  nodeColor={(node) => {
                    if (node.type === 'themeGroup') return themeGroup.color;
                    if (node.type === 'miniTheme') {
                      const themeId = node.id.replace('theme-', '');
                      const foundTheme = themeGroup.themes.find(t => t.id === themeId);
                      return foundTheme?.color || '#6366F1';
                    }
                    return theme === "dark" ? '#374151' : '#e5e7eb';
                  }}
                  maskColor={theme === "dark" ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.1)"}
                  style={{
                    backgroundColor: theme === "dark" ? "#1a1a25" : "#ffffff",
                  }}
                />
              </ReactFlow>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className={cn(
          "px-6 py-3 border-t",
          theme === "dark"
            ? "border-gray-700 bg-[#0a0a0f]"
            : "border-gray-200 bg-gray-50"
        )}>
          <div className={cn(
            "flex items-center gap-6 text-xs",
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          )}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-4 rounded" style={{ backgroundColor: themeGroup.color }}></div>
              <span>Groupe de thème</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-6 h-4 rounded bg-gradient-to-r",
                theme === "dark" ? "from-purple-500 to-cyan-500" : "from-indigo-500 to-purple-500"
              )}></div>
              <span>Mini-thème</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-6 h-4 rounded border-2",
                theme === "dark"
                  ? "border-gray-600 bg-[#1a1a25]"
                  : "border-gray-300 bg-white"
              )}></div>
              <span>Extrait (survol pour détails)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeGroupGraphModal;
