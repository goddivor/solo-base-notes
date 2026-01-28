import React from 'react';
import { Mouse, TextalignLeft, Image, Gallery, Icon } from 'iconsax-react';
import { useTheme } from '../../context/theme-context';
import { cn } from '../../lib/utils';

export type ToolType = 'select' | 'text' | 'image' | 'background';

interface CanvasToolbarProps {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
}

interface ToolItem {
  id: ToolType;
  icon: Icon;
  label: string;
  shortcut: string;
}

const tools: ToolItem[] = [
  { id: 'select', icon: Mouse, label: 'Sélection', shortcut: 'V' },
  { id: 'text', icon: TextalignLeft, label: 'Texte', shortcut: 'T' },
  { id: 'image', icon: Image, label: 'Image', shortcut: 'I' },
  { id: 'background', icon: Gallery, label: 'Fond', shortcut: 'B' },
];

const CanvasToolbar: React.FC<CanvasToolbarProps> = ({ activeTool, onToolChange }) => {
  const { theme } = useTheme();

  return (
    <div className={cn(
      "flex flex-col gap-1 p-2 rounded-xl",
      theme === "dark"
        ? "bg-[#1a1a25] border border-gray-700"
        : "bg-white border border-gray-200 shadow-sm"
    )}>
      {tools.map((tool) => {
        const isActive = activeTool === tool.id;
        const Icon = tool.icon;

        return (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            title={`${tool.label} (${tool.shortcut})`}
            className={cn(
              "relative group w-10 h-10 rounded-lg flex items-center justify-center transition-all",
              isActive
                ? theme === "dark"
                  ? "bg-purple-500 shadow-lg shadow-purple-500/30"
                  : "bg-purple-500 shadow-lg shadow-purple-500/30"
                : theme === "dark"
                  ? "hover:bg-white/10"
                  : "hover:bg-gray-100"
            )}
          >
            <Icon
              size={20}
              variant={isActive ? "Bold" : "Outline"}
              color={isActive ? "#FFFFFF" : theme === "dark" ? "#9CA3AF" : "#6B7280"}
            />

            {/* Tooltip */}
            <div className={cn(
              "absolute left-full ml-2 px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap",
              "opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50",
              theme === "dark"
                ? "bg-gray-800 text-white"
                : "bg-gray-900 text-white"
            )}>
              {tool.label}
              <span className="ml-2 text-gray-400">({tool.shortcut})</span>
            </div>
          </button>
        );
      })}

      {/* Divider */}
      <div className={cn(
        "my-2 border-t",
        theme === "dark" ? "border-gray-700" : "border-gray-200"
      )} />

      {/* Keyboard shortcuts hint */}
      <div className={cn(
        "text-center text-[9px] px-1",
        theme === "dark" ? "text-gray-600" : "text-gray-400"
      )}>
        Raccourcis
      </div>
    </div>
  );
};

export default CanvasToolbar;
