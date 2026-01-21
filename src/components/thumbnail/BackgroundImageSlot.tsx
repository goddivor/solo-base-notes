import React, { useState } from 'react';
import { Gallery, TickCircle, Trash } from 'iconsax-react';
import { useTheme } from '../../context/theme-context';
import { cn } from '../../lib/utils';

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
  const { theme } = useTheme();
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
      <h3 className={cn(
        "text-sm font-bold mb-2",
        theme === "dark" ? "text-white" : "text-gray-900"
      )}>Image de fond</h3>
      <p className={cn(
        "text-xs mb-3",
        theme === "dark" ? "text-gray-400" : "text-gray-500"
      )}>
        Glissez une image pour définir l'arrière-plan
      </p>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative rounded-lg border-2 transition-all overflow-hidden",
          isDragOver
            ? theme === "dark"
              ? "border-purple-500 bg-purple-500/20 scale-105"
              : "border-purple-500 bg-purple-50 scale-105"
            : backgroundImage
            ? theme === "dark"
              ? "border-green-500/50 bg-green-500/10"
              : "border-green-300 bg-green-50"
            : theme === "dark"
              ? "border-dashed border-gray-600 bg-[#1a1a25] hover:border-gray-500"
              : "border-dashed border-gray-300 bg-gray-50 hover:border-gray-400"
        )}
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
            <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all flex items-center justify-center group">
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
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2",
                isDragOver
                  ? "bg-purple-500 animate-bounce"
                  : theme === "dark"
                    ? "bg-gray-700"
                    : "bg-gray-300"
              )}>
                <Gallery size={24} color="#FFFFFF" variant={isDragOver ? 'Bold' : 'Outline'} />
              </div>
              <p className={cn(
                "text-xs font-medium",
                isDragOver
                  ? theme === "dark"
                    ? "text-purple-400"
                    : "text-purple-700"
                  : theme === "dark"
                    ? "text-gray-400"
                    : "text-gray-600"
              )}>
                {isDragOver ? '📥 Déposez l\'image ici' : 'Glissez une image'}
              </p>
              <p className={cn(
                "text-[10px] mt-1",
                theme === "dark" ? "text-gray-500" : "text-gray-400"
              )}>
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
