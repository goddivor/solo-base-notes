import React, { useMemo } from 'react';
import { Gallery, People } from 'iconsax-react';

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
      <div className="p-4 border-b border-gray-200 bg-white">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Sources d'images</h3>
        <p className="text-xs text-gray-500">
          {imageSources.length} image{imageSources.length !== 1 ? 's' : ''} disponible
          {imageSources.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {imageSources.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Gallery size={32} color="#9CA3AF" />
            </div>
            <p className="text-gray-500 text-sm">Aucune image disponible</p>
            <p className="text-gray-400 text-xs mt-1">
              Les extraits ne contiennent pas d'images
            </p>
          </div>
        ) : (
          <>
            {/* Images d'anime */}
            {animeImages.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Gallery size={20} variant="Bold" color="#6366F1" />
                  <h4 className="font-semibold text-gray-900 text-sm">
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
                      className="group relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-indigo-500 transition-all hover:shadow-lg bg-white cursor-grab active:cursor-grabbing"
                    >
                      <div className="aspect-square relative bg-gray-100">
                        <img
                          src={image.url}
                          alt={image.label}
                          className="w-full h-full object-cover relative z-0"
                        />
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity z-10 pointer-events-none"></div>
                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                          <span className="text-white font-semibold text-xs opacity-0 group-hover:opacity-100 transition-opacity px-2 text-center bg-black bg-opacity-50 rounded px-3 py-1">
                            Ajouter
                          </span>
                        </div>
                      </div>
                      <div className="p-2 bg-gray-50 border-t border-gray-200">
                        <p className="text-xs font-medium text-gray-700 truncate">
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
                  <People size={20} variant="Bold" color="#8B5CF6" />
                  <h4 className="font-semibold text-gray-900 text-sm">
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
                      className="group relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-purple-500 transition-all hover:shadow-lg bg-white cursor-grab active:cursor-grabbing"
                    >
                      <div className="aspect-square relative bg-gray-100">
                        <img
                          src={image.url}
                          alt={image.label}
                          className="w-full h-full object-cover relative z-0"
                        />
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity z-10 pointer-events-none"></div>
                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                          <span className="text-white font-semibold text-xs opacity-0 group-hover:opacity-100 transition-opacity px-2 text-center bg-black bg-opacity-50 rounded px-3 py-1">
                            Ajouter
                          </span>
                        </div>
                      </div>
                      <div className="p-2 bg-gray-50 border-t border-gray-200">
                        <p className="text-xs font-medium text-gray-700 truncate">
                          {image.characterName}
                        </p>
                        {image.animeTitle && (
                          <p className="text-[10px] text-gray-500 truncate">
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
