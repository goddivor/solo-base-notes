import React, { useRef, useState, useCallback, useEffect } from 'react';
import type { CanvasElement, TextElement, ImageElement } from '../../types/thumbnail';
import ResizeHandles, { type HandlePosition } from './ResizeHandles';
import { useTheme } from '../../context/theme-context';
import { cn } from '../../lib/utils';
import type { ToolType } from './CanvasToolbar';

interface InteractiveCanvasProps {
  width: number;
  height: number;
  scale: number; // Display scale (e.g., 0.5 for 50%)
  backgroundColor: string;
  backgroundImage: string | null;
  elements: CanvasElement[];
  selectedElementId: string | null;
  activeTool: ToolType;
  onElementSelect: (elementId: string | null) => void;
  onElementUpdate: (elementId: string, updates: Partial<CanvasElement>) => void;
  onAddTextAtPosition: (x: number, y: number) => void;
}

const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({
  width,
  height,
  scale,
  backgroundColor,
  backgroundImage,
  elements,
  selectedElementId,
  activeTool,
  onElementSelect,
  onElementUpdate,
  onAddTextAtPosition,
}) => {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLDivElement>(null);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Resize state
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<HandlePosition | null>(null);
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [resizeStartElement, setResizeStartElement] = useState<{ position: { x: number; y: number }; size: { width: number; height: number } } | null>(null);

  // Get cursor based on active tool
  const getCursor = () => {
    if (isDragging) return 'grabbing';
    if (isResizing) return 'grabbing';

    switch (activeTool) {
      case 'text':
        return 'crosshair';
      case 'select':
        return 'default';
      default:
        return 'default';
    }
  };

  // Handle canvas click (for text tool)
  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only handle clicks directly on the canvas, not on elements
    if (e.target !== canvasRef.current) return;

    if (activeTool === 'text') {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Calculate position in canvas coordinates (original size)
      const x = ((e.clientX - rect.left) / scale);
      const y = ((e.clientY - rect.top) / scale);

      onAddTextAtPosition(x, y);
    } else if (activeTool === 'select') {
      // Click on empty space deselects
      onElementSelect(null);
    }
  };

  // Handle element mouse down (for dragging)
  const handleElementMouseDown = (e: React.MouseEvent, element: CanvasElement) => {
    e.stopPropagation();

    if (activeTool !== 'select') return;
    if (element.locked) return;

    onElementSelect(element.id);

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setIsDragging(true);
    setDragOffset({
      x: (e.clientX - rect.left) / scale - element.position.x,
      y: (e.clientY - rect.top) / scale - element.position.y,
    });
  };

  // Handle resize start
  const handleResizeStart = (handle: HandlePosition, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!selectedElementId) return;
    const element = elements.find(el => el.id === selectedElementId);
    if (!element || element.locked) return;

    setIsResizing(true);
    setResizeHandle(handle);
    setResizeStartPos({ x: e.clientX, y: e.clientY });
    setResizeStartElement({
      position: { ...element.position },
      size: { ...element.size },
    });
  };

  // Handle mouse move
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();

    if (isDragging && selectedElementId) {
      const newX = (e.clientX - rect.left) / scale - dragOffset.x;
      const newY = (e.clientY - rect.top) / scale - dragOffset.y;

      // Clamp to canvas bounds
      const clampedX = Math.max(0, Math.min(width - 50, newX));
      const clampedY = Math.max(0, Math.min(height - 50, newY));

      onElementUpdate(selectedElementId, {
        position: { x: clampedX, y: clampedY },
      });
    }

    if (isResizing && selectedElementId && resizeHandle && resizeStartElement) {
      const deltaX = (e.clientX - resizeStartPos.x) / scale;
      const deltaY = (e.clientY - resizeStartPos.y) / scale;

      let newPosition = { ...resizeStartElement.position };
      let newSize = { ...resizeStartElement.size };

      // Calculate new position and size based on handle
      switch (resizeHandle) {
        case 'nw':
          newPosition.x = resizeStartElement.position.x + deltaX;
          newPosition.y = resizeStartElement.position.y + deltaY;
          newSize.width = resizeStartElement.size.width - deltaX;
          newSize.height = resizeStartElement.size.height - deltaY;
          break;
        case 'n':
          newPosition.y = resizeStartElement.position.y + deltaY;
          newSize.height = resizeStartElement.size.height - deltaY;
          break;
        case 'ne':
          newPosition.y = resizeStartElement.position.y + deltaY;
          newSize.width = resizeStartElement.size.width + deltaX;
          newSize.height = resizeStartElement.size.height - deltaY;
          break;
        case 'e':
          newSize.width = resizeStartElement.size.width + deltaX;
          break;
        case 'se':
          newSize.width = resizeStartElement.size.width + deltaX;
          newSize.height = resizeStartElement.size.height + deltaY;
          break;
        case 's':
          newSize.height = resizeStartElement.size.height + deltaY;
          break;
        case 'sw':
          newPosition.x = resizeStartElement.position.x + deltaX;
          newSize.width = resizeStartElement.size.width - deltaX;
          newSize.height = resizeStartElement.size.height + deltaY;
          break;
        case 'w':
          newPosition.x = resizeStartElement.position.x + deltaX;
          newSize.width = resizeStartElement.size.width - deltaX;
          break;
      }

      // Ensure minimum size
      if (newSize.width < 20) {
        newSize.width = 20;
        if (resizeHandle.includes('w')) {
          newPosition.x = resizeStartElement.position.x + resizeStartElement.size.width - 20;
        }
      }
      if (newSize.height < 20) {
        newSize.height = 20;
        if (resizeHandle.includes('n')) {
          newPosition.y = resizeStartElement.position.y + resizeStartElement.size.height - 20;
        }
      }

      onElementUpdate(selectedElementId, {
        position: newPosition,
        size: newSize,
      });
    }
  }, [isDragging, isResizing, selectedElementId, dragOffset, resizeHandle, resizeStartPos, resizeStartElement, scale, width, height, onElementUpdate]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
    setResizeStartElement(null);
  }, []);

  // Add global mouse listeners
  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  // Render element
  const renderElement = (element: CanvasElement) => {
    if (!element.visible) return null;

    const isSelected = selectedElementId === element.id;
    const positionStyle = {
      left: `${(element.position.x / width) * 100}%`,
      top: `${(element.position.y / height) * 100}%`,
      zIndex: element.zIndex,
      opacity: element.opacity,
      transform: `rotate(${element.rotation}deg)`,
    };

    if (element.type === 'text') {
      const textEl = element as TextElement;
      return (
        <div
          key={element.id}
          className={cn(
            "absolute select-none",
            activeTool === 'select' && !element.locked && "cursor-grab",
            isDragging && isSelected && "cursor-grabbing",
            isSelected && "ring-2 ring-purple-500 ring-offset-2"
          )}
          style={{
            ...positionStyle,
            fontSize: `${textEl.fontSize * scale}px`,
            fontFamily: textEl.fontFamily,
            fontWeight: textEl.fontWeight,
            color: textEl.color,
            textAlign: textEl.textAlign,
            WebkitTextStroke: textEl.strokeWidth ? `${textEl.strokeWidth * scale}px ${textEl.strokeColor}` : 'none',
            whiteSpace: 'pre-wrap',
            maxWidth: textEl.maxWidth ? `${textEl.maxWidth * scale}px` : 'none',
          }}
          onMouseDown={(e) => handleElementMouseDown(e, element)}
        >
          {textEl.text}
          {isSelected && activeTool === 'select' && !element.locked && (
            <ResizeHandles onResizeStart={handleResizeStart} scale={scale} />
          )}
        </div>
      );
    }

    if (element.type === 'image') {
      const imgEl = element as ImageElement;
      return (
        <div
          key={element.id}
          className={cn(
            "absolute select-none",
            activeTool === 'select' && !element.locked && "cursor-grab",
            isDragging && isSelected && "cursor-grabbing",
            isSelected && "ring-2 ring-purple-500"
          )}
          style={{
            ...positionStyle,
            width: `${(imgEl.size.width / width) * 100}%`,
            height: `${(imgEl.size.height / height) * 100}%`,
          }}
          onMouseDown={(e) => handleElementMouseDown(e, element)}
        >
          <img
            src={imgEl.imageUrl}
            alt={imgEl.label}
            className="w-full h-full object-cover pointer-events-none"
            draggable={false}
          />
          {isSelected && activeTool === 'select' && !element.locked && (
            <ResizeHandles onResizeStart={handleResizeStart} scale={scale} />
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div
      ref={canvasRef}
      className={cn(
        "relative overflow-hidden rounded-lg",
        theme === "dark" ? "shadow-2xl shadow-black/50" : "shadow-xl"
      )}
      style={{
        width: `${width * scale}px`,
        height: `${height * scale}px`,
        backgroundColor,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        cursor: getCursor(),
      }}
      onClick={handleCanvasClick}
    >
      {/* Grid overlay for alignment */}
      {activeTool === 'text' && (
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, ${theme === "dark" ? "#fff" : "#000"} 1px, transparent 1px),
              linear-gradient(to bottom, ${theme === "dark" ? "#fff" : "#000"} 1px, transparent 1px)
            `,
            backgroundSize: `${50 * scale}px ${50 * scale}px`,
          }}
        />
      )}

      {/* Render all elements */}
      {elements
        .sort((a, b) => a.zIndex - b.zIndex)
        .map(renderElement)}

      {/* Text tool indicator */}
      {activeTool === 'text' && (
        <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-purple-500 text-white text-xs font-medium pointer-events-none">
          Cliquez pour ajouter du texte
        </div>
      )}
    </div>
  );
};

export default InteractiveCanvas;
