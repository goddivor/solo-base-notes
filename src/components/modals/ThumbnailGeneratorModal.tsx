import React, { useState, useEffect } from 'react';
import { CloseCircle } from 'iconsax-react';
import Button from '../actions/button';
import ImageSourcePanel from '../thumbnail/ImageSourcePanel';
import BackgroundImageSlot from '../thumbnail/BackgroundImageSlot';
import ElementAddButtons from '../thumbnail/ElementAddButtons';
import LayerItem from '../thumbnail/LayerItem';
import ElementPropertiesPanel from '../thumbnail/ElementPropertiesPanel';
import { DEFAULT_PRESET } from '../../lib/thumbnail-presets';
import { exportThumbnail, generateThumbnailFilename } from '../../lib/thumbnail-export';
import type { CanvasElement, TextElement, ImageElement } from '../../types/thumbnail';
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

interface ThumbnailGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoTitle: string;
  segments: VideoSegment[];
}

const ThumbnailGeneratorModal: React.FC<ThumbnailGeneratorModalProps> = ({
  isOpen,
  onClose,
  videoTitle,
  segments,
}) => {
  const { theme } = useTheme();
  const [preset] = useState(DEFAULT_PRESET);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Initialiser les textes par défaut au chargement
  useEffect(() => {
    if (isOpen && elements.length === 0) {
      const defaultTextElements: TextElement[] = preset.defaultTexts.map((template, index) => ({
        id: `text-default-${index}`,
        type: 'text',
        ...template,
        size: { width: template.maxWidth || 1800, height: template.fontSize * 1.5 },
        zIndex: 100 + index, // Textes au-dessus des images
        rotation: 0,
        opacity: 1,
        visible: true,
      }));
      setElements(defaultTextElements);
    }
  }, [isOpen, preset, elements.length]);

  // Ajouter une image au canvas (clic simple)
  const handleAddImage = (imageUrl: string, label: string) => {
    const newImageElement: ImageElement = {
      id: `image-${Date.now()}`,
      type: 'image',
      imageUrl,
      label,
      position: { x: 400, y: 200 }, // Position par défaut au centre-gauche
      size: { width: 500, height: 600 },
      zIndex: elements.length + 1, // Au-dessus des autres
      rotation: 0,
      opacity: 1,
      visible: true,
    };

    setElements([...elements, newImageElement]);
    setSelectedElementId(newImageElement.id);
    console.log('Image ajoutée:', label);
  };

  // Définir l'image de fond
  const handleSetBackground = (imageUrl: string) => {
    setBackgroundImage(imageUrl);
    console.log('Image de fond définie');
  };

  // Retirer l'image de fond
  const handleRemoveBackground = () => {
    setBackgroundImage(null);
    console.log('Image de fond retirée');
  };

  // Supprimer un élément
  const handleDeleteElement = (elementId: string) => {
    setElements(elements.filter(el => el.id !== elementId));
    if (selectedElementId === elementId) {
      setSelectedElementId(null);
    }
  };

  // Mettre à jour un élément
  const handleUpdateElement = (elementId: string, updates: Partial<CanvasElement>) => {
    setElements(elements.map(el =>
      el.id === elementId ? { ...el, ...updates } as CanvasElement : el
    ));
  };

  // Ajouter un nouvel élément texte
  const handleAddText = () => {
    const newTextElement: TextElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      text: 'Nouveau texte',
      position: { x: 960, y: 540 }, // Centre du canvas
      size: { width: 800, height: 100 },
      fontSize: 80,
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontWeight: '900',
      color: '#FFFFFF',
      strokeColor: '#000000',
      strokeWidth: 8,
      textAlign: 'center',
      zIndex: elements.length + 1,
      rotation: 0,
      opacity: 1,
      visible: true,
    };

    setElements([...elements, newTextElement]);
    setSelectedElementId(newTextElement.id);
    console.log('Élément texte ajouté');
  };

  // Ajouter un nouvel élément image (via prompt)
  const handleAddImageFromUrl = () => {
    const imageUrl = prompt('Entrez l\'URL de l\'image :');
    if (!imageUrl) return;

    const label = prompt('Nom de l\'image (optionnel) :') || 'Image personnalisée';

    const newImageElement: ImageElement = {
      id: `image-${Date.now()}`,
      type: 'image',
      imageUrl,
      label,
      position: { x: 960, y: 540 }, // Centre du canvas
      size: { width: 500, height: 600 },
      zIndex: elements.length + 1,
      rotation: 0,
      opacity: 1,
      visible: true,
    };

    setElements([...elements, newImageElement]);
    setSelectedElementId(newImageElement.id);
    console.log('Élément image ajouté:', label);
  };

  // Basculer la visibilité d'un élément
  const handleToggleVisibility = (elementId: string) => {
    setElements(elements.map(el =>
      el.id === elementId ? { ...el, visible: !el.visible } as CanvasElement : el
    ));
  };

  // Basculer le verrouillage d'un élément
  const handleToggleLock = (elementId: string) => {
    setElements(elements.map(el =>
      el.id === elementId ? { ...el, locked: !el.locked } as CanvasElement : el
    ));
  };

  // Monter un élément (augmenter zIndex)
  const handleMoveUp = (elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    // Trouver l'élément juste au-dessus (zIndex supérieur le plus proche)
    const elementsAbove = elements.filter(el => el.zIndex > element.zIndex);
    if (elementsAbove.length === 0) return; // Déjà au sommet

    const nextElement = elementsAbove.reduce((prev, curr) =>
      curr.zIndex < prev.zIndex ? curr : prev
    );

    // Échanger les zIndex
    setElements(elements.map(el => {
      if (el.id === elementId) return { ...el, zIndex: nextElement.zIndex } as CanvasElement;
      if (el.id === nextElement.id) return { ...el, zIndex: element.zIndex } as CanvasElement;
      return el;
    }));
  };

  // Descendre un élément (diminuer zIndex)
  const handleMoveDown = (elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    // Trouver l'élément juste en-dessous (zIndex inférieur le plus proche)
    const elementsBelow = elements.filter(el => el.zIndex < element.zIndex);
    if (elementsBelow.length === 0) return; // Déjà au fond

    const prevElement = elementsBelow.reduce((prev, curr) =>
      curr.zIndex > prev.zIndex ? curr : prev
    );

    // Échanger les zIndex
    setElements(elements.map(el => {
      if (el.id === elementId) return { ...el, zIndex: prevElement.zIndex } as CanvasElement;
      if (el.id === prevElement.id) return { ...el, zIndex: element.zIndex } as CanvasElement;
      return el;
    }));
  };

  // Exporter la miniature
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const filename = generateThumbnailFilename(videoTitle);
      await exportThumbnail({
        width: preset.canvasSize.width,
        height: preset.canvasSize.height,
        backgroundColor: preset.backgroundColor,
        backgroundImage,
        elements,
        filename,
      });
      console.log('Miniature exportée avec succès:', filename);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export de la miniature. Vérifiez la console pour plus de détails.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className={cn(
        "rounded-xl shadow-2xl w-full h-full max-h-[95vh] overflow-hidden flex flex-col",
        theme === "dark" ? "bg-[#12121a]" : "bg-white"
      )}>
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-cyan-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎨</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Générateur de Miniature</h2>
              <p className="text-sm text-white/80 mt-0.5">{videoTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <CloseCircle size={28} variant="Bold" color="#FFFFFF" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Image Sources */}
          <div className={cn(
            "w-[30%] border-r overflow-hidden",
            theme === "dark"
              ? "border-gray-700 bg-[#0a0a0f]"
              : "border-gray-200 bg-gray-50"
          )}>
            <ImageSourcePanel
              segments={segments}
              onImageSelect={handleAddImage}
              onImageDragStart={(_, label) => console.log('Drag started:', label)}
            />
          </div>

          {/* Center Panel - Canvas Preview */}
          <div className={cn(
            "flex-1 overflow-auto flex items-center justify-center p-6",
            theme === "dark" ? "bg-[#0a0a0f]" : "bg-gray-100"
          )}>
            <div className={cn(
              "rounded-lg shadow-2xl p-4",
              theme === "dark" ? "bg-[#1a1a25]" : "bg-white"
            )}>
              <div
                className={cn(
                  "relative border-4 rounded",
                  theme === "dark" ? "border-gray-600" : "border-gray-300"
                )}
                style={{
                  width: '960px', // 50% de 1920
                  height: '540px', // 50% de 1080
                  backgroundColor: preset.backgroundColor,
                  backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {/* Rendu simplifié des éléments */}
                {elements.map((element) => {
                  if (!element.visible) return null;

                  if (element.type === 'text') {
                    const textEl = element as TextElement;
                    return (
                      <div
                        key={element.id}
                        className="absolute pointer-events-none"
                        style={{
                          left: `${(textEl.position.x / 1920) * 100}%`,
                          top: `${(textEl.position.y / 1080) * 100}%`,
                          transform: 'translate(-50%, -50%)',
                          fontSize: `${textEl.fontSize / 2}px`, // Scalé 50%
                          fontFamily: textEl.fontFamily,
                          fontWeight: textEl.fontWeight,
                          color: textEl.color,
                          textAlign: textEl.textAlign,
                          WebkitTextStroke: textEl.strokeWidth ? `${textEl.strokeWidth / 2}px ${textEl.strokeColor}` : 'none',
                          zIndex: element.zIndex,
                          opacity: element.opacity,
                        }}
                      >
                        {textEl.text}
                      </div>
                    );
                  }

                  if (element.type === 'image') {
                    const imgEl = element as ImageElement;
                    return (
                      <img
                        key={element.id}
                        src={imgEl.imageUrl}
                        alt={imgEl.label}
                        className="absolute"
                        style={{
                          left: `${(imgEl.position.x / 1920) * 100}%`,
                          top: `${(imgEl.position.y / 1080) * 100}%`,
                          width: `${(imgEl.size.width / 1920) * 100}%`,
                          height: `${(imgEl.size.height / 1080) * 100}%`,
                          transform: `rotate(${imgEl.rotation}deg)`,
                          zIndex: element.zIndex,
                          opacity: element.opacity,
                          objectFit: 'cover',
                        }}
                      />
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          </div>

          {/* Right Panel - Background & Elements */}
          <div className={cn(
            "w-[20%] border-l overflow-y-auto",
            theme === "dark"
              ? "border-gray-700 bg-[#0a0a0f]"
              : "border-gray-200 bg-gray-50"
          )}>
            <div className="p-4">
              {/* Background Image Slot */}
              <BackgroundImageSlot
                backgroundImage={backgroundImage}
                onSetBackground={handleSetBackground}
                onRemoveBackground={handleRemoveBackground}
              />

              {/* Divider */}
              <div className={cn(
                "border-t my-6",
                theme === "dark" ? "border-gray-700" : "border-gray-300"
              )}></div>

              {/* Element Addition Buttons */}
              <ElementAddButtons
                onAddText={handleAddText}
                onAddImage={handleAddImageFromUrl}
              />

              {/* Divider */}
              <div className={cn(
                "border-t my-6",
                theme === "dark" ? "border-gray-700" : "border-gray-300"
              )}></div>

              {/* Elements List */}
              <h3 className={cn(
                "text-sm font-bold mb-2",
                theme === "dark" ? "text-white" : "text-gray-900"
              )}>Calques</h3>
              <p className={cn(
                "text-xs mb-3",
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              )}>
                {elements.length} élément{elements.length !== 1 ? 's' : ''}
              </p>

              <div>
                {elements.length === 0 ? (
                  <div className={cn(
                    "text-center py-8 text-xs",
                    theme === "dark" ? "text-gray-500" : "text-gray-400"
                  )}>
                    <p>Aucun calque</p>
                    <p className="mt-1">Ajoutez des images ou textes</p>
                  </div>
                ) : (
                  // Trier par zIndex décroissant (les éléments du dessus en premier)
                  [...elements]
                    .sort((a, b) => b.zIndex - a.zIndex)
                    .map((element, index, sortedArray) => (
                      <LayerItem
                        key={element.id}
                        element={element}
                        isSelected={selectedElementId === element.id}
                        isFirst={index === 0}
                        isLast={index === sortedArray.length - 1}
                        onSelect={() => setSelectedElementId(element.id)}
                        onDelete={() => handleDeleteElement(element.id)}
                        onToggleVisibility={() => handleToggleVisibility(element.id)}
                        onToggleLock={() => handleToggleLock(element.id)}
                        onMoveUp={() => handleMoveUp(element.id)}
                        onMoveDown={() => handleMoveDown(element.id)}
                      />
                    ))
                )}
              </div>

              {/* Divider */}
              <div className={cn(
                "border-t my-6",
                theme === "dark" ? "border-gray-700" : "border-gray-300"
              )}></div>

              {/* Element Properties Panel */}
              <ElementPropertiesPanel
                element={elements.find(el => el.id === selectedElementId) || null}
                onUpdate={handleUpdateElement}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={cn(
          "border-t px-6 py-4 flex items-center justify-between flex-shrink-0",
          theme === "dark"
            ? "border-gray-700 bg-[#0a0a0f]"
            : "border-gray-200 bg-gray-50"
        )}>
          <div className={cn(
            "text-sm",
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          )}>
            {segments.length} segment{segments.length !== 1 ? 's' : ''} disponible{segments.length !== 1 ? 's' : ''}
          </div>
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-colors",
                theme === "dark"
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              )}
            >
              Annuler
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:from-purple-400 hover:to-cyan-400 rounded-lg font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? 'Export en cours...' : 'Exporter PNG'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThumbnailGeneratorModal;
