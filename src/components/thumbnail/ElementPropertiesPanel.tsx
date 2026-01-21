import React from 'react';
import type { CanvasElement, TextElement, ImageElement } from '../../types/thumbnail';
import { useTheme } from '../../context/theme-context';
import { cn } from '../../lib/utils';

interface ElementPropertiesPanelProps {
  element: CanvasElement | null;
  onUpdate: (elementId: string, updates: Partial<CanvasElement>) => void;
}

const ElementPropertiesPanel: React.FC<ElementPropertiesPanelProps> = ({
  element,
  onUpdate,
}) => {
  const { theme } = useTheme();

  if (!element) {
    return (
      <div className={cn(
        "p-4 rounded-lg border-2 border-dashed",
        theme === "dark"
          ? "bg-[#1a1a25] border-gray-600"
          : "bg-gray-50 border-gray-300"
      )}>
        <p className={cn(
          "text-xs text-center",
          theme === "dark" ? "text-gray-500" : "text-gray-500"
        )}>
          Sélectionnez un élément pour modifier ses propriétés
        </p>
      </div>
    );
  }

  const isText = element.type === 'text';
  const textElement = isText ? (element as TextElement) : null;
  const imageElement = !isText ? (element as ImageElement) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className={cn(
          "text-sm font-bold",
          theme === "dark" ? "text-white" : "text-gray-900"
        )}>Propriétés</h4>
        <span className={cn(
          "text-xs",
          theme === "dark" ? "text-gray-400" : "text-gray-500"
        )}>
          {isText ? '📝 Texte' : '🖼️ Image'}
        </span>
      </div>

      {/* Text-specific properties */}
      {textElement && (
        <>
          {/* Text content */}
          <div>
            <label className={cn(
              "block text-xs font-semibold mb-1",
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            )}>
              Texte
            </label>
            <textarea
              value={textElement.text}
              onChange={(e) => onUpdate(element.id, { text: e.target.value })}
              className={cn(
                "w-full px-2 py-1.5 text-xs border rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none",
                theme === "dark"
                  ? "bg-[#0a0a0f] border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              )}
              rows={3}
            />
          </div>

          {/* Font family */}
          <div>
            <label className={cn(
              "block text-xs font-semibold mb-1",
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            )}>
              Police
            </label>
            <select
              value={textElement.fontFamily}
              onChange={(e) => onUpdate(element.id, { fontFamily: e.target.value })}
              className={cn(
                "w-full px-2 py-1.5 text-xs border rounded focus:ring-2 focus:ring-purple-500",
                theme === "dark"
                  ? "bg-[#0a0a0f] border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              )}
            >
              <option value="Impact, Arial Black, sans-serif">Impact</option>
              <option value="Arial, sans-serif">Arial</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="'Courier New', monospace">Courier New</option>
              <option value="'Times New Roman', serif">Times New Roman</option>
            </select>
          </div>

          {/* Font size & weight */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={cn(
                "block text-xs font-semibold mb-1",
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              )}>
                Taille
              </label>
              <input
                type="number"
                value={textElement.fontSize}
                onChange={(e) => onUpdate(element.id, { fontSize: Number(e.target.value) })}
                className={cn(
                  "w-full px-2 py-1.5 text-xs border rounded focus:ring-2 focus:ring-purple-500",
                  theme === "dark"
                    ? "bg-[#0a0a0f] border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                )}
                min="10"
                max="300"
              />
            </div>
            <div>
              <label className={cn(
                "block text-xs font-semibold mb-1",
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              )}>
                Graisse
              </label>
              <select
                value={textElement.fontWeight}
                onChange={(e) => onUpdate(element.id, { fontWeight: e.target.value as 'normal' | 'bold' | '900' })}
                className={cn(
                  "w-full px-2 py-1.5 text-xs border rounded focus:ring-2 focus:ring-purple-500",
                  theme === "dark"
                    ? "bg-[#0a0a0f] border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                )}
              >
                <option value="normal">Normal</option>
                <option value="bold">Gras</option>
                <option value="900">Extra Gras</option>
              </select>
            </div>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={cn(
                "block text-xs font-semibold mb-1",
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              )}>
                Couleur
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={textElement.color}
                  onChange={(e) => onUpdate(element.id, { color: e.target.value })}
                  className={cn(
                    "w-10 h-8 border rounded cursor-pointer",
                    theme === "dark" ? "border-gray-600" : "border-gray-300"
                  )}
                />
                <input
                  type="text"
                  value={textElement.color}
                  onChange={(e) => onUpdate(element.id, { color: e.target.value })}
                  className={cn(
                    "flex-1 px-2 py-1.5 text-xs border rounded focus:ring-2 focus:ring-purple-500",
                    theme === "dark"
                      ? "bg-[#0a0a0f] border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  )}
                />
              </div>
            </div>
            <div>
              <label className={cn(
                "block text-xs font-semibold mb-1",
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              )}>
                Contour
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={textElement.strokeColor || '#000000'}
                  onChange={(e) => onUpdate(element.id, { strokeColor: e.target.value })}
                  className={cn(
                    "w-10 h-8 border rounded cursor-pointer",
                    theme === "dark" ? "border-gray-600" : "border-gray-300"
                  )}
                />
                <input
                  type="number"
                  value={textElement.strokeWidth || 0}
                  onChange={(e) => onUpdate(element.id, { strokeWidth: Number(e.target.value) })}
                  className={cn(
                    "flex-1 px-2 py-1.5 text-xs border rounded focus:ring-2 focus:ring-purple-500",
                    theme === "dark"
                      ? "bg-[#0a0a0f] border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  )}
                  min="0"
                  max="20"
                  placeholder="Épaisseur"
                />
              </div>
            </div>
          </div>

          {/* Text align */}
          <div>
            <label className={cn(
              "block text-xs font-semibold mb-1",
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            )}>
              Alignement
            </label>
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => onUpdate(element.id, { textAlign: 'left' })}
                className={cn(
                  "px-2 py-1.5 text-xs border rounded transition-colors",
                  textElement.textAlign === 'left'
                    ? "bg-purple-500 text-white border-purple-600"
                    : theme === "dark"
                      ? "bg-[#1a1a25] text-gray-300 border-gray-600 hover:bg-gray-700"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                )}
              >
                Gauche
              </button>
              <button
                onClick={() => onUpdate(element.id, { textAlign: 'center' })}
                className={cn(
                  "px-2 py-1.5 text-xs border rounded transition-colors",
                  textElement.textAlign === 'center'
                    ? "bg-purple-500 text-white border-purple-600"
                    : theme === "dark"
                      ? "bg-[#1a1a25] text-gray-300 border-gray-600 hover:bg-gray-700"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                )}
              >
                Centre
              </button>
              <button
                onClick={() => onUpdate(element.id, { textAlign: 'right' })}
                className={cn(
                  "px-2 py-1.5 text-xs border rounded transition-colors",
                  textElement.textAlign === 'right'
                    ? "bg-purple-500 text-white border-purple-600"
                    : theme === "dark"
                      ? "bg-[#1a1a25] text-gray-300 border-gray-600 hover:bg-gray-700"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                )}
              >
                Droite
              </button>
            </div>
          </div>
        </>
      )}

      {/* Image-specific properties */}
      {imageElement && (
        <>
          <div>
            <label className={cn(
              "block text-xs font-semibold mb-1",
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            )}>
              Nom
            </label>
            <input
              type="text"
              value={imageElement.label || ''}
              onChange={(e) => onUpdate(element.id, { label: e.target.value })}
              className={cn(
                "w-full px-2 py-1.5 text-xs border rounded focus:ring-2 focus:ring-purple-500",
                theme === "dark"
                  ? "bg-[#0a0a0f] border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              )}
              placeholder="Nom de l'image"
            />
          </div>

          <div>
            <label className={cn(
              "block text-xs font-semibold mb-1",
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            )}>
              URL de l'image
            </label>
            <input
              type="text"
              value={imageElement.imageUrl}
              onChange={(e) => onUpdate(element.id, { imageUrl: e.target.value })}
              className={cn(
                "w-full px-2 py-1.5 text-xs border rounded focus:ring-2 focus:ring-purple-500",
                theme === "dark"
                  ? "bg-[#0a0a0f] border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              )}
              placeholder="https://..."
            />
          </div>

          {/* Size */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={cn(
                "block text-xs font-semibold mb-1",
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              )}>
                Largeur
              </label>
              <input
                type="number"
                value={imageElement.size.width}
                onChange={(e) => onUpdate(element.id, { size: { ...imageElement.size, width: Number(e.target.value) } })}
                className={cn(
                  "w-full px-2 py-1.5 text-xs border rounded focus:ring-2 focus:ring-purple-500",
                  theme === "dark"
                    ? "bg-[#0a0a0f] border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                )}
                min="10"
                max="1920"
              />
            </div>
            <div>
              <label className={cn(
                "block text-xs font-semibold mb-1",
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              )}>
                Hauteur
              </label>
              <input
                type="number"
                value={imageElement.size.height}
                onChange={(e) => onUpdate(element.id, { size: { ...imageElement.size, height: Number(e.target.value) } })}
                className={cn(
                  "w-full px-2 py-1.5 text-xs border rounded focus:ring-2 focus:ring-purple-500",
                  theme === "dark"
                    ? "bg-[#0a0a0f] border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                )}
                min="10"
                max="1080"
              />
            </div>
          </div>
        </>
      )}

      {/* Common properties */}
      <div className={cn(
        "border-t pt-4",
        theme === "dark" ? "border-gray-700" : "border-gray-300"
      )}>
        <h5 className={cn(
          "text-xs font-bold mb-3",
          theme === "dark" ? "text-gray-300" : "text-gray-700"
        )}>Transformation</h5>

        {/* Position */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className={cn(
              "block text-xs font-semibold mb-1",
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            )}>
              Position X
            </label>
            <input
              type="number"
              value={element.position.x}
              onChange={(e) => onUpdate(element.id, { position: { ...element.position, x: Number(e.target.value) } })}
              className={cn(
                "w-full px-2 py-1.5 text-xs border rounded focus:ring-2 focus:ring-purple-500",
                theme === "dark"
                  ? "bg-[#0a0a0f] border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              )}
              min="0"
              max="1920"
            />
          </div>
          <div>
            <label className={cn(
              "block text-xs font-semibold mb-1",
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            )}>
              Position Y
            </label>
            <input
              type="number"
              value={element.position.y}
              onChange={(e) => onUpdate(element.id, { position: { ...element.position, y: Number(e.target.value) } })}
              className={cn(
                "w-full px-2 py-1.5 text-xs border rounded focus:ring-2 focus:ring-purple-500",
                theme === "dark"
                  ? "bg-[#0a0a0f] border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              )}
              min="0"
              max="1080"
            />
          </div>
        </div>

        {/* Rotation */}
        <div className="mb-3">
          <label className={cn(
            "block text-xs font-semibold mb-1",
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          )}>
            Rotation (degrés)
          </label>
          <input
            type="number"
            value={element.rotation}
            onChange={(e) => onUpdate(element.id, { rotation: Number(e.target.value) })}
            className={cn(
              "w-full px-2 py-1.5 text-xs border rounded focus:ring-2 focus:ring-purple-500",
              theme === "dark"
                ? "bg-[#0a0a0f] border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            )}
            min="-360"
            max="360"
          />
        </div>

        {/* Opacity */}
        <div>
          <label className={cn(
            "block text-xs font-semibold mb-1",
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          )}>
            Opacité: {Math.round(element.opacity * 100)}%
          </label>
          <input
            type="range"
            value={element.opacity}
            onChange={(e) => onUpdate(element.id, { opacity: Number(e.target.value) })}
            className="w-full accent-purple-500"
            min="0"
            max="1"
            step="0.01"
          />
        </div>
      </div>
    </div>
  );
};

export default ElementPropertiesPanel;
