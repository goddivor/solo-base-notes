import React, { useMemo } from 'react';
import { Gallery, People } from 'iconsax-react';
import { useTheme } from '../../context/theme-context';
import { cn } from '../../lib/utils';

interface Character {
  malId: number;
  name: string;
  image?: string;
}

interface Extract {
  id: string;
  animeId: number;
  animeTitle: string;
  animeImage?: string;
  characters: Character[];
}

interface VideoSegment {
  extractId: string;
  text: string;
  order: number;
  extract?: Extract;
}

interface ImageSource {
  id: string;
  url: string;
  label: string;
  type: 'anime' | 'character';
  animeTitle?: string;
  characterName?: string;
}

interface ImageSourcePanelProps {
  segments: VideoSegment[];
  onImageSelect: (imageUrl: string, label: string) => void;
  onImageDragStart?: (imageUrl: string, label: string) => void;
}

const ImageSourcePanel: React.FC<ImageSourcePanelProps> = ({ segments, onImageSelect, onImageDragStart }) => {
  const { theme } = useTheme();

  const handleDragStart = (imageUrl: string, label: string) => (e: React.DragEvent) => {
    e.dataTransfer.setData('imageUrl', imageUrl);
    e.dataTransfer.setData('imageLabel', label);
    e.dataTransfer.effectAllowed = 'copy';

    if (onImageDragStart) {
      onImageDragStart(imageUrl, label);
    }
  };
  // Extraire toutes les images disponibles depuis les segments
  const imageSources = useMemo(() => {
    const sources: ImageSource[] = [];
    const seenUrls = new Set<string>();

    segments.forEach((segment) => {
      const extract = segment.extract;
      if (!extract) return;

      // Ajouter l'image de l'anime
      if (extract.animeImage && !seenUrls.has(extract.animeImage)) {
        sources.push({
          id: `anime-${extract.animeId}`,
          url: extract.animeImage,
          label: extract.animeTitle,
          type: 'anime',
          animeTitle: extract.animeTitle,
        });
        seenUrls.add(extract.animeImage);
      }

      // Ajouter les images des personnages
      extract.characters.forEach((character) => {
        if (character.image && !seenUrls.has(character.image)) {
          sources.push({
            id: `character-${character.malId}`,
            url: character.image,
            label: character.name,
            type: 'character',
            animeTitle: extract.animeTitle,
            characterName: character.name,
          });
          seenUrls.add(character.image);
        }
      });
    });

    return sources;
  }, [segments]);

  // Séparer les images par type
  const animeImages = imageSources.filter((img) => img.type === 'anime');
  const characterImages = imageSources.filter((img) => img.type === 'character');

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className={cn(
        "p-4 border-b",
        theme === "dark"
          ? "border-gray-700 bg-[#12121a]"
          : "border-gray-200 bg-white"
      )}>
        <h3 className={cn(
          "text-lg font-bold mb-1",
          theme === "dark" ? "text-white" : "text-gray-900"
        )}>Sources d'images</h3>
        <p className={cn(
          "text-xs",
          theme === "dark" ? "text-gray-400" : "text-gray-500"
        )}>
          {imageSources.length} image{imageSources.length !== 1 ? 's' : ''} disponible
          {imageSources.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {imageSources.length === 0 ? (
          <div className="text-center py-12">
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3",
              theme === "dark" ? "bg-gray-800" : "bg-gray-100"
            )}>
              <Gallery size={32} color={theme === "dark" ? "#6B7280" : "#9CA3AF"} />
            </div>
            <p className={cn(
              "text-sm",
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            )}>Aucune image disponible</p>
            <p className={cn(
              "text-xs mt-1",
              theme === "dark" ? "text-gray-500" : "text-gray-400"
            )}>
              Les extraits ne contiennent pas d'images
            </p>
          </div>
        ) : (
          <>
            {/* Images d'anime */}
            {animeImages.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Gallery size={20} variant="Bold" color={theme === "dark" ? "#A855F7" : "#6366F1"} />
                  <h4 className={cn(
                    "font-semibold text-sm",
                    theme === "dark" ? "text-white" : "text-gray-900"
                  )}>
                    Images d'anime ({animeImages.length})
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {animeImages.map((image) => (
                    <button
                      key={image.id}
                      draggable={true}
                      onDragStart={handleDragStart(image.url, image.label)}
                      onClick={() => onImageSelect(image.url, image.label)}
                      className={cn(
                        "group relative overflow-hidden rounded-lg border-2 transition-all hover:shadow-lg cursor-grab active:cursor-grabbing",
                        theme === "dark"
                          ? "border-gray-700 hover:border-purple-500 bg-[#1a1a25]"
                          : "border-gray-200 hover:border-indigo-500 bg-white"
                      )}
                    >
                      <div className={cn(
                        "aspect-square relative",
                        theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                      )}>
                        <img
                          src={image.url}
                          alt={image.label}
                          className="w-full h-full object-cover relative z-0"
                        />
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity z-10 pointer-events-none"></div>
                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                          <span className="text-white font-semibold text-xs opacity-0 group-hover:opacity-100 transition-opacity px-2 text-center bg-black/50 rounded px-3 py-1">
                            Ajouter
                          </span>
                        </div>
                      </div>
                      <div className={cn(
                        "p-2 border-t",
                        theme === "dark"
                          ? "bg-[#12121a] border-gray-700"
                          : "bg-gray-50 border-gray-200"
                      )}>
                        <p className={cn(
                          "text-xs font-medium truncate",
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        )}>
                          {image.label}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Images de personnages */}
            {characterImages.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <People size={20} variant="Bold" color={theme === "dark" ? "#06B6D4" : "#8B5CF6"} />
                  <h4 className={cn(
                    "font-semibold text-sm",
                    theme === "dark" ? "text-white" : "text-gray-900"
                  )}>
                    Personnages ({characterImages.length})
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {characterImages.map((image) => (
                    <button
                      key={image.id}
                      draggable={true}
                      onDragStart={handleDragStart(image.url, image.label)}
                      onClick={() => onImageSelect(image.url, image.label)}
                      className={cn(
                        "group relative overflow-hidden rounded-lg border-2 transition-all hover:shadow-lg cursor-grab active:cursor-grabbing",
                        theme === "dark"
                          ? "border-gray-700 hover:border-cyan-500 bg-[#1a1a25]"
                          : "border-gray-200 hover:border-purple-500 bg-white"
                      )}
                    >
                      <div className={cn(
                        "aspect-square relative",
                        theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                      )}>
                        <img
                          src={image.url}
                          alt={image.label}
                          className="w-full h-full object-cover relative z-0"
                        />
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity z-10 pointer-events-none"></div>
                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                          <span className="text-white font-semibold text-xs opacity-0 group-hover:opacity-100 transition-opacity px-2 text-center bg-black/50 rounded px-3 py-1">
                            Ajouter
                          </span>
                        </div>
                      </div>
                      <div className={cn(
                        "p-2 border-t",
                        theme === "dark"
                          ? "bg-[#12121a] border-gray-700"
                          : "bg-gray-50 border-gray-200"
                      )}>
                        <p className={cn(
                          "text-xs font-medium truncate",
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        )}>
                          {image.characterName}
                        </p>
                        {image.animeTitle && (
                          <p className={cn(
                            "text-[10px] truncate",
                            theme === "dark" ? "text-gray-500" : "text-gray-500"
                          )}>
                            {image.animeTitle}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ImageSourcePanel;
