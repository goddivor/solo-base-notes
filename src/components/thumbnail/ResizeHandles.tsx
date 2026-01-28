import React from 'react';
import { cn } from '../../lib/utils';

export type HandlePosition = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

interface ResizeHandlesProps {
  onResizeStart: (handle: HandlePosition, e: React.MouseEvent) => void;
  scale?: number; // Scale factor for preview (0.5 for 50%)
}

const handles: { position: HandlePosition; cursor: string; className: string }[] = [
  { position: 'nw', cursor: 'nwse-resize', className: '-top-1 -left-1' },
  { position: 'n', cursor: 'ns-resize', className: '-top-1 left-1/2 -translate-x-1/2' },
  { position: 'ne', cursor: 'nesw-resize', className: '-top-1 -right-1' },
  { position: 'e', cursor: 'ew-resize', className: 'top-1/2 -right-1 -translate-y-1/2' },
  { position: 'se', cursor: 'nwse-resize', className: '-bottom-1 -right-1' },
  { position: 's', cursor: 'ns-resize', className: '-bottom-1 left-1/2 -translate-x-1/2' },
  { position: 'sw', cursor: 'nesw-resize', className: '-bottom-1 -left-1' },
  { position: 'w', cursor: 'ew-resize', className: 'top-1/2 -left-1 -translate-y-1/2' },
];

const ResizeHandles: React.FC<ResizeHandlesProps> = ({ onResizeStart, scale = 1 }) => {
  const handleSize = Math.max(6, 8 * scale);

  return (
    <>
      {handles.map((handle) => (
        <div
          key={handle.position}
          onMouseDown={(e) => {
            e.stopPropagation();
            onResizeStart(handle.position, e);
          }}
          className={cn(
            "absolute bg-white border-2 border-purple-500 rounded-sm z-50",
            "hover:bg-purple-500 hover:scale-125 transition-transform",
            handle.className
          )}
          style={{
            width: `${handleSize}px`,
            height: `${handleSize}px`,
            cursor: handle.cursor,
          }}
        />
      ))}
    </>
  );
};

export default ResizeHandles;
