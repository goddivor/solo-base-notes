import React, { useState } from 'react';
import { Gallery, TickCircle, Trash } from 'iconsax-react';

interface BackgroundImageSlotProps {
  backgroundImage: string | null;
  onSetBackground: (imageUrl: string) => void;
  onRemoveBackground: () => void;
}

const BackgroundImageSlot: React.FC<BackgroundImageSlotProps> = ({
  backgroundImage,
  onSetBackground,
  onRemoveBackground,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const imageUrl = e.dataTransfer.getData('imageUrl');
    if (imageUrl) {
      onSetBackground(imageUrl);
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-sm font-bold text-gray-900 mb-2">Image de fond</h3>
      <p className="text-xs text-gray-500 mb-3">
        Glissez une image pour définir l'arrière-plan
      </p>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative rounded-lg border-2 transition-all overflow-hidden
          ${
            isDragOver
              ? 'border-purple-500 bg-purple-50 scale-105'
              : backgroundImage
              ? 'border-green-300 bg-green-50'
              : 'border-dashed border-gray-300 bg-gray-50 hover:border-gray-400'
          }
        `}
      >
        {backgroundImage ? (
          // Fond défini - Afficher preview
          <div className="relative">
            <div className="aspect-video">
              <img
                src={backgroundImage}
                alt="Background"
                className="w-full h-full object-cover rounded"
              />
            </div>

            {/* Overlay avec boutons */}
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all flex items-center justify-center group">
              <button
                onClick={onRemoveBackground}
                className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 bg-red-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-red-700"
              >
                <Trash size={18} variant="Bold" color="#FFFFFF" />
                Retirer
              </button>
            </div>

            {/* Badge confirmé */}
            <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded flex items-center gap-1">
              <TickCircle size={14} variant="Bold" color="#FFFFFF" />
              Défini
            </div>
          </div>
        ) : (
          // Pas de fond - Zone de drop
          <div className="aspect-video flex items-center justify-center p-4">
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                isDragOver ? 'bg-purple-500 animate-bounce' : 'bg-gray-300'
              }`}>
                <Gallery size={24} color="#FFFFFF" variant={isDragOver ? 'Bold' : 'Outline'} />
              </div>
              <p className={`text-xs font-medium ${isDragOver ? 'text-purple-700' : 'text-gray-600'}`}>
                {isDragOver ? '📥 Déposez l\'image ici' : 'Glissez une image'}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">
                1920 × 1080
              </p>
            </div>
          </div>
        )}

        {/* Animation de drop */}
        {isDragOver && (
          <div className="absolute inset-0 border-4 border-purple-500 rounded-lg pointer-events-none animate-pulse" />
        )}
      </div>
    </div>
  );
};

export default BackgroundImageSlot;
