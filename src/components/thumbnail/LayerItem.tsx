import React from 'react';
import { Eye, EyeSlash, Lock, LockSlash, ArrowUp2, ArrowDown2, Trash } from 'iconsax-react';
import type { CanvasElement, TextElement, ImageElement } from '../../types/thumbnail';
import { useTheme } from '../../context/theme-context';
import { cn } from '../../lib/utils';

interface LayerItemProps {
  element: CanvasElement;
  isSelected: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const LayerItem: React.FC<LayerItemProps> = ({
  element,
  isSelected,
  isFirst,
  isLast,
  onSelect,
  onDelete,
  onToggleVisibility,
  onToggleLock,
  onMoveUp,
  onMoveDown,
}) => {
  const { theme } = useTheme();
  const isText = element.type === 'text';
  const label = isText
    ? (element as TextElement).text.substring(0, 20)
    : (element as ImageElement).label || 'Image';

  return (
    <div
      onClick={onSelect}
      className={cn(
        "p-2 rounded-lg border-2 cursor-pointer transition-all mb-2",
        isSelected
          ? theme === "dark"
            ? "border-purple-500 bg-purple-500/20 shadow-md"
            : "border-indigo-500 bg-indigo-50 shadow-md"
          : theme === "dark"
            ? "border-gray-700 bg-[#1a1a25] hover:border-gray-600 hover:shadow-sm"
            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      )}
    >
      {/* Main content */}
      <div className="flex items-center gap-2 mb-2">
        {/* Type icon */}
        <span className="text-base flex-shrink-0">
          {isText ? '📝' : '🖼️'}
        </span>

        {/* Label */}
        <span className={cn(
          "text-xs font-medium truncate flex-1 min-w-0",
          theme === "dark" ? "text-gray-200" : "text-gray-900"
        )}>
          {label}
        </span>

        {/* Visibility toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
          className={cn(
            "p-1 rounded transition-colors flex-shrink-0",
            element.visible
              ? theme === "dark"
                ? "text-gray-400 hover:text-purple-400"
                : "text-gray-600 hover:text-indigo-600"
              : theme === "dark"
                ? "text-gray-600 hover:text-gray-400"
                : "text-gray-300 hover:text-gray-500"
          )}
          title={element.visible ? 'Masquer' : 'Afficher'}
        >
          {element.visible ? (
            <Eye size={16} variant="Bold" color={element.visible ? (theme === "dark" ? "#9CA3AF" : "#4B5563") : "#D1D5DB"} />
          ) : (
            <EyeSlash size={16} variant="Bold" color={theme === "dark" ? "#4B5563" : "#D1D5DB"} />
          )}
        </button>

        {/* Lock toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleLock();
          }}
          className={cn(
            "p-1 rounded transition-colors flex-shrink-0",
            element.locked
              ? "text-yellow-600 hover:text-yellow-700"
              : theme === "dark"
                ? "text-gray-500 hover:text-gray-400"
                : "text-gray-400 hover:text-gray-600"
          )}
          title={element.locked ? 'Déverrouiller' : 'Verrouiller'}
        >
          {element.locked ? (
            <Lock size={16} variant="Bold" color="#CA8A04" />
          ) : (
            <LockSlash size={16} variant="Outline" color={theme === "dark" ? "#6B7280" : "#9CA3AF"} />
          )}
        </button>
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-1">
        {/* Move up */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp();
          }}
          disabled={isFirst}
          className={cn(
            "p-1 rounded transition-colors",
            isFirst
              ? theme === "dark"
                ? "text-gray-600 cursor-not-allowed"
                : "text-gray-300 cursor-not-allowed"
              : theme === "dark"
                ? "text-gray-400 hover:text-purple-400 hover:bg-purple-500/20"
                : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-100"
          )}
          title="Monter"
        >
          <ArrowUp2 size={14} variant="Bold" color={isFirst ? (theme === "dark" ? "#4B5563" : "#D1D5DB") : (theme === "dark" ? "#9CA3AF" : "#4B5563")} />
        </button>

        {/* Move down */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown();
          }}
          disabled={isLast}
          className={cn(
            "p-1 rounded transition-colors",
            isLast
              ? theme === "dark"
                ? "text-gray-600 cursor-not-allowed"
                : "text-gray-300 cursor-not-allowed"
              : theme === "dark"
                ? "text-gray-400 hover:text-purple-400 hover:bg-purple-500/20"
                : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-100"
          )}
          title="Descendre"
        >
          <ArrowDown2 size={14} variant="Bold" color={isLast ? (theme === "dark" ? "#4B5563" : "#D1D5DB") : (theme === "dark" ? "#9CA3AF" : "#4B5563")} />
        </button>

        {/* zIndex indicator */}
        <span className={cn(
          "text-[10px] ml-auto mr-2",
          theme === "dark" ? "text-gray-500" : "text-gray-400"
        )}>
          z: {element.zIndex}
        </span>

        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className={cn(
            "p-1 rounded transition-colors",
            theme === "dark" ? "hover:bg-red-500/20" : "hover:bg-red-100"
          )}
          title="Supprimer"
        >
          <Trash size={14} variant="Bold" color="#EF4444" />
        </button>
      </div>
    </div>
  );
};

export default LayerItem;
