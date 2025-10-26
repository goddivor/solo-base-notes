import type { ThumbnailPreset } from '../types/thumbnail';

// Preset 1: "YouTube Citation" - Style miniature YouTube clickbait
const youtubeCitationPreset: ThumbnailPreset = {
  id: 'youtube-citation',
  name: 'YouTube Citation',
  description: 'Style miniature YouTube avec texte impactant et personnage en arrière-plan',
  canvasSize: {
    width: 1920,
    height: 1080,
  },
  backgroundColor: '#000000',
  // Textes par défaut qui seront ajoutés automatiquement au canvas
  defaultTexts: [],
};

// Export des presets disponibles
export const THUMBNAIL_PRESETS: ThumbnailPreset[] = [
  youtubeCitationPreset,
];

// Export du preset par défaut (YouTube Citation)
export const DEFAULT_PRESET = youtubeCitationPreset;

// Helper pour obtenir un preset par ID
export const getPresetById = (id: string): ThumbnailPreset | undefined => {
  return THUMBNAIL_PRESETS.find((preset) => preset.id === id);
};
