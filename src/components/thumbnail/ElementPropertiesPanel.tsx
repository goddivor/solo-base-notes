import React from 'react';
import type { CanvasElement, TextElement, ImageElement } from '../../types/thumbnail';

interface ElementPropertiesPanelProps {
  element: CanvasElement | null;
  onUpdate: (elementId: string, updates: Partial<CanvasElement>) => void;
}

const ElementPropertiesPanel: React.FC<ElementPropertiesPanelProps> = ({
  element,
  onUpdate,
}) => {
  if (!element) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-xs text-gray-500 text-center">
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
        <h4 className="text-sm font-bold text-gray-900">Propriétés</h4>
        <span className="text-xs text-gray-500">
          {isText ? '📝 Texte' : '🖼️ Image'}
        </span>
      </div>

      {/* Text-specific properties */}
      {textElement && (
        <>
          {/* Text content */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Texte
            </label>
            <textarea
              value={textElement.text}
              onChange={(e) => onUpdate(element.id, { text: e.target.value })}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              rows={3}
            />
          </div>

          {/* Font family */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Police
            </label>
            <select
              value={textElement.fontFamily}
              onChange={(e) => onUpdate(element.id, { fontFamily: e.target.value })}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
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
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Taille
              </label>
              <input
                type="number"
                value={textElement.fontSize}
                onChange={(e) => onUpdate(element.id, { fontSize: Number(e.target.value) })}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                min="10"
                max="300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Graisse
              </label>
              <select
                value={textElement.fontWeight}
                onChange={(e) => onUpdate(element.id, { fontWeight: e.target.value as 'normal' | 'bold' | '900' })}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
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
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Couleur
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={textElement.color}
                  onChange={(e) => onUpdate(element.id, { color: e.target.value })}
                  className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={textElement.color}
                  onChange={(e) => onUpdate(element.id, { color: e.target.value })}
                  className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Contour
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={textElement.strokeColor || '#000000'}
                  onChange={(e) => onUpdate(element.id, { strokeColor: e.target.value })}
                  className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="number"
                  value={textElement.strokeWidth || 0}
                  onChange={(e) => onUpdate(element.id, { strokeWidth: Number(e.target.value) })}
                  className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  max="20"
                  placeholder="Épaisseur"
                />
              </div>
            </div>
          </div>

          {/* Text align */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Alignement
            </label>
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => onUpdate(element.id, { textAlign: 'left' })}
                className={`px-2 py-1.5 text-xs border rounded transition-colors ${
                  textElement.textAlign === 'left'
                    ? 'bg-indigo-500 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Gauche
              </button>
              <button
                onClick={() => onUpdate(element.id, { textAlign: 'center' })}
                className={`px-2 py-1.5 text-xs border rounded transition-colors ${
                  textElement.textAlign === 'center'
                    ? 'bg-indigo-500 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Centre
              </button>
              <button
                onClick={() => onUpdate(element.id, { textAlign: 'right' })}
                className={`px-2 py-1.5 text-xs border rounded transition-colors ${
                  textElement.textAlign === 'right'
                    ? 'bg-indigo-500 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
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
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nom
            </label>
            <input
              type="text"
              value={imageElement.label || ''}
              onChange={(e) => onUpdate(element.id, { label: e.target.value })}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
              placeholder="Nom de l'image"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              URL de l'image
            </label>
            <input
              type="text"
              value={imageElement.imageUrl}
              onChange={(e) => onUpdate(element.id, { imageUrl: e.target.value })}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
              placeholder="https://..."
            />
          </div>

          {/* Size */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Largeur
              </label>
              <input
                type="number"
                value={imageElement.size.width}
                onChange={(e) => onUpdate(element.id, { size: { ...imageElement.size, width: Number(e.target.value) } })}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                min="10"
                max="1920"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Hauteur
              </label>
              <input
                type="number"
                value={imageElement.size.height}
                onChange={(e) => onUpdate(element.id, { size: { ...imageElement.size, height: Number(e.target.value) } })}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                min="10"
                max="1080"
              />
            </div>
          </div>
        </>
      )}

      {/* Common properties */}
      <div className="border-t border-gray-300 pt-4">
        <h5 className="text-xs font-bold text-gray-700 mb-3">Transformation</h5>

        {/* Position */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Position X
            </label>
            <input
              type="number"
              value={element.position.x}
              onChange={(e) => onUpdate(element.id, { position: { ...element.position, x: Number(e.target.value) } })}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
              min="0"
              max="1920"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Position Y
            </label>
            <input
              type="number"
              value={element.position.y}
              onChange={(e) => onUpdate(element.id, { position: { ...element.position, y: Number(e.target.value) } })}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
              min="0"
              max="1080"
            />
          </div>
        </div>

        {/* Rotation */}
        <div className="mb-3">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Rotation (degrés)
          </label>
          <input
            type="number"
            value={element.rotation}
            onChange={(e) => onUpdate(element.id, { rotation: Number(e.target.value) })}
            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
            min="-360"
            max="360"
          />
        </div>

        {/* Opacity */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Opacité: {Math.round(element.opacity * 100)}%
          </label>
          <input
            type="range"
            value={element.opacity}
            onChange={(e) => onUpdate(element.id, { opacity: Number(e.target.value) })}
            className="w-full"
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
