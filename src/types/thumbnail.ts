// Types pour le générateur de miniatures (Architecture type Photoshop)

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

// Types d'éléments
export type ElementType = 'image' | 'text';

// Élément de base (abstrait)
interface BaseElement {
  id: string;
  type: ElementType;
  position: Position;
  size: Size;
  zIndex: number;
  rotation: number;
  opacity: number;
  locked?: boolean; // Verrouiller l'élément
  visible?: boolean; // Masquer/afficher
}

// Élément Image
export interface ImageElement extends BaseElement {
  type: 'image';
  imageUrl: string;
  label?: string; // Ex: "Kurapika", "Gon"
}

// Élément Texte
export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold' | '900';
  color: string;
  strokeColor?: string;
  strokeWidth?: number;
  textAlign: 'left' | 'center' | 'right';
  maxWidth?: number;
}

// Union type pour tous les éléments
export type CanvasElement = ImageElement | TextElement;

// Template par défaut d'un texte
export interface DefaultTextTemplate {
  text: string;
  position: Position;
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold' | '900';
  color: string;
  strokeColor?: string;
  strokeWidth?: number;
  textAlign: 'left' | 'center' | 'right';
  maxWidth?: number;
}

// Preset simplifié (juste fond + textes par défaut)
export interface ThumbnailPreset {
  id: string;
  name: string;
  description: string;
  canvasSize: Size; // Toujours 1920x1080 pour YouTube
  backgroundColor: string;
  // Textes par défaut à ajouter automatiquement
  defaultTexts: DefaultTextTemplate[];
}

// État complet du canvas
export interface ThumbnailState {
  preset: ThumbnailPreset;
  backgroundImage: string | null; // URL de l'image de fond (optionnelle)
  elements: CanvasElement[]; // Tous les éléments (images + textes)
  selectedElementId: string | null; // Élément actuellement sélectionné
}
