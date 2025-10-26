import React from 'react';
import { Eye, EyeSlash, Lock, LockSlash, ArrowUp2, ArrowDown2, Trash } from 'iconsax-react';
import type { CanvasElement, TextElement, ImageElement } from '../../types/thumbnail';

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
  const isText = element.type === 'text';
  const label = isText
    ? (element as TextElement).text.substring(0, 20)
    : (element as ImageElement).label || 'Image';

  return (
    <div
      onClick={onSelect}
      className={`
        p-2 rounded-lg border-2 cursor-pointer transition-all mb-2
        ${
          isSelected
            ? 'border-indigo-500 bg-indigo-50 shadow-md'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        }
      `}
    >
      {/* Main content */}
      <div className="flex items-center gap-2 mb-2">
        {/* Type icon */}
        <span className="text-base flex-shrink-0">
          {isText ? '📝' : '🖼️'}
        </span>

        {/* Label */}
        <span className="text-xs font-medium truncate flex-1 min-w-0">
          {label}
        </span>

        {/* Visibility toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
          className={`p-1 rounded transition-colors flex-shrink-0 ${
            element.visible
              ? 'text-gray-600 hover:text-indigo-600'
              : 'text-gray-300 hover:text-gray-500'
          }`}
          title={element.visible ? 'Masquer' : 'Afficher'}
        >
          {element.visible ? (
            <Eye size={16} variant="Bold" />
          ) : (
            <EyeSlash size={16} variant="Bold" />
          )}
        </button>

        {/* Lock toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleLock();
          }}
          className={`p-1 rounded transition-colors flex-shrink-0 ${
            element.locked
              ? 'text-yellow-600 hover:text-yellow-700'
              : 'text-gray-400 hover:text-gray-600'
          }`}
          title={element.locked ? 'Déverrouiller' : 'Verrouiller'}
        >
          {element.locked ? (
            <Lock size={16} variant="Bold" />
          ) : (
            <LockSlash size={16} variant="Outline" />
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
          className={`p-1 rounded transition-colors ${
            isFirst
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-100'
          }`}
          title="Monter"
        >
          <ArrowUp2 size={14} variant="Bold" />
        </button>

        {/* Move down */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown();
          }}
          disabled={isLast}
          className={`p-1 rounded transition-colors ${
            isLast
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-100'
          }`}
          title="Descendre"
        >
          <ArrowDown2 size={14} variant="Bold" />
        </button>

        {/* zIndex indicator */}
        <span className="text-[10px] text-gray-400 ml-auto mr-2">
          z: {element.zIndex}
        </span>

        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 rounded hover:bg-red-100 transition-colors"
          title="Supprimer"
        >
          <Trash size={14} variant="Bold" color="#EF4444" />
        </button>
      </div>
    </div>
  );
};

export default LayerItem;
