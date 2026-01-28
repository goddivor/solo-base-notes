import React, { useState, useEffect, useCallback } from 'react';
import { useMutation } from '@apollo/client';
import { CloseCircle, ArrowRight2, ArrowLeft2, Trash, TickCircle } from 'iconsax-react';
import Button from '../actions/button';
import ImageSourcePanel from '../thumbnail/ImageSourcePanel';
import BackgroundImageSlot from '../thumbnail/BackgroundImageSlot';
import CanvasToolbar, { type ToolType } from '../thumbnail/CanvasToolbar';
import InteractiveCanvas from '../thumbnail/InteractiveCanvas';
import LayerItem from '../thumbnail/LayerItem';
import ElementPropertiesPanel from '../thumbnail/ElementPropertiesPanel';
import { DEFAULT_PRESET } from '../../lib/thumbnail-presets';
import { exportThumbnail, generateThumbnailFilename, generateThumbnailBase64 } from '../../lib/thumbnail-export';
import { UPLOAD_VIDEO_THUMBNAIL, DELETE_VIDEO_THUMBNAIL } from '../../lib/graphql/mutations';
import type { CanvasElement, TextElement, ImageElement } from '../../types/thumbnail';
import { useTheme } from '../../context/theme-context';
import { useToast } from '../../context/toast-context';
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

interface VideoThumbnail {
  url: string;
  fileId: string;
  name?: string;
  createdAt: string;
}

interface ThumbnailGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  videoTitle: string;
  segments: VideoSegment[];
  currentThumbnail?: VideoThumbnail | null;
  onThumbnailChange?: () => void;
}

const ThumbnailGeneratorModal: React.FC<ThumbnailGeneratorModalProps> = ({
  isOpen,
  onClose,
  videoId,
  videoTitle,
  segments,
  currentThumbnail,
  onThumbnailChange,
}) => {
  const { theme } = useTheme();
  const toast = useToast();
  const [preset] = useState(DEFAULT_PRESET);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  // Mutations
  const [uploadThumbnail] = useMutation(UPLOAD_VIDEO_THUMBNAIL);
  const [deleteThumbnail] = useMutation(DELETE_VIDEO_THUMBNAIL);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case 'v':
          setActiveTool('select');
          break;
        case 't':
          setActiveTool('text');
          break;
        case 'i':
          setActiveTool('image');
          setIsRightPanelOpen(true);
          break;
        case 'b':
          setActiveTool('background');
          setIsRightPanelOpen(true);
          break;
        case 'delete':
        case 'backspace':
          if (selectedElementId) {
            handleDeleteElement(selectedElementId);
          }
          break;
        case 'escape':
          setSelectedElementId(null);
          setActiveTool('select');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedElementId]);

  // Open sources panel when image tool is selected
  useEffect(() => {
    if (activeTool === 'image' || activeTool === 'background') {
      setIsRightPanelOpen(true);
    }
  }, [activeTool]);

  // Add text at position (for text tool)
  const handleAddTextAtPosition = useCallback((x: number, y: number) => {
    const newTextElement: TextElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      text: 'Nouveau texte',
      position: { x, y },
      size: { width: 800, height: 100 },
      fontSize: 80,
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontWeight: '900',
      color: '#FFFFFF',
      strokeColor: '#000000',
      strokeWidth: 8,
      textAlign: 'center',
      zIndex: elements.length + 100,
      rotation: 0,
      opacity: 1,
      visible: true,
    };

    setElements(prev => [...prev, newTextElement]);
    setSelectedElementId(newTextElement.id);
    setActiveTool('select'); // Switch back to select after adding
  }, [elements.length]);

  // Add image to canvas
  const handleAddImage = (imageUrl: string, label: string) => {
    const newImageElement: ImageElement = {
      id: `image-${Date.now()}`,
      type: 'image',
      imageUrl,
      label,
      position: { x: 400, y: 200 },
      size: { width: 500, height: 600 },
      zIndex: elements.length + 1,
      rotation: 0,
      opacity: 1,
      visible: true,
    };

    setElements(prev => [...prev, newImageElement]);
    setSelectedElementId(newImageElement.id);
    setActiveTool('select');
  };

  // Set background image
  const handleSetBackground = (imageUrl: string) => {
    setBackgroundImage(imageUrl);
    setActiveTool('select');
  };

  // Remove background image
  const handleRemoveBackground = () => {
    setBackgroundImage(null);
  };

  // Delete element
  const handleDeleteElement = (elementId: string) => {
    setElements(prev => prev.filter(el => el.id !== elementId));
    if (selectedElementId === elementId) {
      setSelectedElementId(null);
    }
  };

  // Update element
  const handleUpdateElement = (elementId: string, updates: Partial<CanvasElement>) => {
    setElements(prev => prev.map(el =>
      el.id === elementId ? { ...el, ...updates } as CanvasElement : el
    ));
  };

  // Toggle visibility
  const handleToggleVisibility = (elementId: string) => {
    setElements(prev => prev.map(el =>
      el.id === elementId ? { ...el, visible: !el.visible } as CanvasElement : el
    ));
  };

  // Toggle lock
  const handleToggleLock = (elementId: string) => {
    setElements(prev => prev.map(el =>
      el.id === elementId ? { ...el, locked: !el.locked } as CanvasElement : el
    ));
  };

  // Move up (increase zIndex)
  const handleMoveUp = (elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const elementsAbove = elements.filter(el => el.zIndex > element.zIndex);
    if (elementsAbove.length === 0) return;

    const nextElement = elementsAbove.reduce((prev, curr) =>
      curr.zIndex < prev.zIndex ? curr : prev
    );

    setElements(prev => prev.map(el => {
      if (el.id === elementId) return { ...el, zIndex: nextElement.zIndex } as CanvasElement;
      if (el.id === nextElement.id) return { ...el, zIndex: element.zIndex } as CanvasElement;
      return el;
    }));
  };

  // Move down (decrease zIndex)
  const handleMoveDown = (elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const elementsBelow = elements.filter(el => el.zIndex < element.zIndex);
    if (elementsBelow.length === 0) return;

    const prevElement = elementsBelow.reduce((prev, curr) =>
      curr.zIndex > prev.zIndex ? curr : prev
    );

    setElements(prev => prev.map(el => {
      if (el.id === elementId) return { ...el, zIndex: prevElement.zIndex } as CanvasElement;
      if (el.id === prevElement.id) return { ...el, zIndex: element.zIndex } as CanvasElement;
      return el;
    }));
  };

  // Export thumbnail (download)
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
      toast.success('Téléchargement', 'Miniature téléchargée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      toast.error('Erreur', 'Erreur lors du téléchargement de la miniature');
    } finally {
      setIsExporting(false);
    }
  };

  // Save thumbnail to server (ImageKit)
  const handleSave = async () => {
    if (elements.length === 0 && !backgroundImage) {
      toast.error('Erreur', 'Ajoutez au moins un élément ou une image de fond');
      return;
    }

    setIsSaving(true);
    try {
      const imageBase64 = await generateThumbnailBase64({
        width: preset.canvasSize.width,
        height: preset.canvasSize.height,
        backgroundColor: preset.backgroundColor,
        backgroundImage,
        elements,
      });

      const fileName = generateThumbnailFilename(videoTitle);

      await uploadThumbnail({
        variables: {
          videoId,
          imageBase64,
          fileName,
        },
      });

      toast.success('Sauvegardé', 'Miniature sauvegardée avec succès');
      onThumbnailChange?.();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur', 'Erreur lors de la sauvegarde de la miniature');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete thumbnail from server
  const handleDeleteThumbnail = async () => {
    if (!currentThumbnail) return;

    try {
      await deleteThumbnail({
        variables: { videoId },
      });
      toast.success('Supprimé', 'Miniature supprimée avec succès');
      onThumbnailChange?.();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur', 'Erreur lors de la suppression de la miniature');
    }
  };

  if (!isOpen) return null;

  const selectedElement = elements.find(el => el.id === selectedElementId) || null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <div className={cn(
        "rounded-2xl shadow-2xl w-[98vw] h-[95vh] overflow-hidden flex flex-col",
        theme === "dark" ? "bg-[#0a0a0f]" : "bg-gray-100"
      )}>
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-cyan-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <span className="text-xl">🎨</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Générateur de Miniature</h2>
              <p className="text-xs text-white/70">{videoTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <CloseCircle size={24} variant="Bold" color="#FFFFFF" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Toolbar */}
          <div className={cn(
            "flex-shrink-0 p-3 flex flex-col items-center border-r",
            theme === "dark"
              ? "bg-[#12121a] border-gray-800"
              : "bg-white border-gray-200"
          )}>
            <CanvasToolbar
              activeTool={activeTool}
              onToolChange={setActiveTool}
            />
          </div>

          {/* Center - Canvas */}
          <div className={cn(
            "flex-1 overflow-auto flex items-center justify-center p-4",
            theme === "dark" ? "bg-[#0a0a0f]" : "bg-gray-200"
          )}>
            <InteractiveCanvas
              width={preset.canvasSize.width}
              height={preset.canvasSize.height}
              scale={0.5}
              backgroundColor={preset.backgroundColor}
              backgroundImage={backgroundImage}
              elements={elements}
              selectedElementId={selectedElementId}
              activeTool={activeTool}
              onElementSelect={setSelectedElementId}
              onElementUpdate={handleUpdateElement}
              onAddTextAtPosition={handleAddTextAtPosition}
            />
          </div>

          {/* Right Panel - Collapsible */}
          <div className={cn(
            "flex-shrink-0 border-l transition-all duration-300 overflow-hidden flex flex-col",
            theme === "dark"
              ? "bg-[#12121a] border-gray-800"
              : "bg-white border-gray-200",
            isRightPanelOpen ? "w-72" : "w-0"
          )}>
            {isRightPanelOpen && (
              <div className="h-full flex flex-col overflow-hidden">
                {/* Sources Section (for image/background tools) */}
                {(activeTool === 'image' || activeTool === 'background') ? (
                  <div className="flex-1 overflow-hidden flex flex-col">
                    <div className={cn(
                      "p-3 border-b flex items-center justify-between",
                      theme === "dark" ? "border-gray-800" : "border-gray-200"
                    )}>
                      <h3 className={cn(
                        "text-sm font-bold",
                        theme === "dark" ? "text-white" : "text-gray-900"
                      )}>
                        {activeTool === 'background' ? 'Image de fond' : 'Sources d\'images'}
                      </h3>
                    </div>

                    {activeTool === 'background' ? (
                      <div className="p-3">
                        <BackgroundImageSlot
                          backgroundImage={backgroundImage}
                          onSetBackground={handleSetBackground}
                          onRemoveBackground={handleRemoveBackground}
                        />
                      </div>
                    ) : (
                      <div className="flex-1 overflow-y-auto">
                        <ImageSourcePanel
                          segments={segments}
                          onImageSelect={handleAddImage}
                          onImageDragStart={(_, label) => console.log('Drag started:', label)}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  /* Properties & Layers Section (for select tool) */
                  <div className="flex-1 overflow-y-auto">
                    {/* Properties Panel */}
                    <div className={cn(
                      "p-3 border-b",
                      theme === "dark" ? "border-gray-800" : "border-gray-200"
                    )}>
                      <ElementPropertiesPanel
                        element={selectedElement}
                        onUpdate={handleUpdateElement}
                      />
                    </div>

                    {/* Layers Panel */}
                    <div className="p-3">
                      <h3 className={cn(
                        "text-sm font-bold mb-2",
                        theme === "dark" ? "text-white" : "text-gray-900"
                      )}>
                        Calques
                      </h3>
                      <p className={cn(
                        "text-xs mb-3",
                        theme === "dark" ? "text-gray-500" : "text-gray-500"
                      )}>
                        {elements.length} élément{elements.length !== 1 ? 's' : ''}
                      </p>

                      {elements.length === 0 ? (
                        <div className={cn(
                          "text-center py-6 text-xs",
                          theme === "dark" ? "text-gray-600" : "text-gray-400"
                        )}>
                          <p>Aucun calque</p>
                          <p className="mt-1">Utilisez l'outil Texte (T) ou Image (I)</p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {[...elements]
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
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Toggle Right Panel Button */}
          <button
            onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
            className={cn(
              "absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-l-lg transition-all",
              theme === "dark"
                ? "bg-gray-800 hover:bg-gray-700 text-gray-400"
                : "bg-gray-200 hover:bg-gray-300 text-gray-600",
              isRightPanelOpen ? "mr-72" : "mr-0"
            )}
          >
            {isRightPanelOpen ? (
              <ArrowRight2 size={16} color={theme === "dark" ? "#9CA3AF" : "#4B5563"} />
            ) : (
              <ArrowLeft2 size={16} color={theme === "dark" ? "#9CA3AF" : "#4B5563"} />
            )}
          </button>
        </div>

        {/* Footer */}
        <div className={cn(
          "border-t px-4 py-3 flex items-center justify-between flex-shrink-0",
          theme === "dark"
            ? "border-gray-800 bg-[#12121a]"
            : "border-gray-200 bg-white"
        )}>
          <div className={cn(
            "text-sm flex items-center gap-4",
            theme === "dark" ? "text-gray-500" : "text-gray-500"
          )}>
            {/* Current thumbnail status */}
            {currentThumbnail ? (
              <div className="flex items-center gap-2">
                <TickCircle size={16} variant="Bold" color="#22C55E" />
                <span className="text-green-500">Miniature sauvegardée</span>
                <button
                  onClick={handleDeleteThumbnail}
                  className={cn(
                    "p-1 rounded transition-colors",
                    theme === "dark"
                      ? "hover:bg-red-500/20 text-red-400"
                      : "hover:bg-red-100 text-red-500"
                  )}
                  title="Supprimer la miniature"
                >
                  <Trash size={14} color="#EF4444" />
                </button>
              </div>
            ) : (
              <span>{elements.length} calque{elements.length !== 1 ? 's' : ''}</span>
            )}
            <span>•</span>
            <span className="flex items-center gap-1">
              <kbd className={cn(
                "px-1.5 py-0.5 rounded text-xs",
                theme === "dark" ? "bg-gray-800" : "bg-gray-100"
              )}>V</kbd>
              Sélection
              <kbd className={cn(
                "px-1.5 py-0.5 rounded text-xs ml-2",
                theme === "dark" ? "bg-gray-800" : "bg-gray-100"
              )}>T</kbd>
              Texte
              <kbd className={cn(
                "px-1.5 py-0.5 rounded text-xs ml-2",
                theme === "dark" ? "bg-gray-800" : "bg-gray-100"
              )}>I</kbd>
              Image
            </span>
          </div>
          <div className="flex gap-2">
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
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-colors",
                theme === "dark"
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              )}
            >
              {isExporting ? 'Export...' : 'Exporter PNG'}
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || (elements.length === 0 && !backgroundImage)}
              className="px-5 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:from-purple-400 hover:to-cyan-400 rounded-lg font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Sauvegarde...' : currentThumbnail ? 'Mettre à jour' : 'Sauvegarder'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThumbnailGeneratorModal;
