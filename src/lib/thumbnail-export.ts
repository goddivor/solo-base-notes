import type { CanvasElement, TextElement, ImageElement } from '../types/thumbnail';

interface ExportOptions {
  width: number;
  height: number;
  backgroundColor: string;
  backgroundImage: string | null;
  elements: CanvasElement[];
  filename?: string;
}

/**
 * Charge une image depuis une URL et retourne un HTMLImageElement
 */
const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Pour éviter les problèmes CORS si possible
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
};

/**
 * Dessine un élément texte sur le canvas
 */
const drawTextElement = (
  ctx: CanvasRenderingContext2D,
  element: TextElement
) => {
  ctx.save();

  // Position et transformation
  ctx.translate(element.position.x, element.position.y);
  ctx.rotate((element.rotation * Math.PI) / 180);
  ctx.globalAlpha = element.opacity;

  // Configuration du texte
  ctx.font = `${element.fontWeight} ${element.fontSize}px ${element.fontFamily}`;
  ctx.textAlign = element.textAlign;
  ctx.textBaseline = 'middle';

  // Contour (stroke)
  if (element.strokeWidth && element.strokeWidth > 0) {
    ctx.strokeStyle = element.strokeColor || '#000000';
    ctx.lineWidth = element.strokeWidth;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeText(element.text, 0, 0);
  }

  // Remplissage (fill)
  ctx.fillStyle = element.color;
  ctx.fillText(element.text, 0, 0);

  ctx.restore();
};

/**
 * Dessine un élément image sur le canvas
 */
const drawImageElement = async (
  ctx: CanvasRenderingContext2D,
  element: ImageElement
) => {
  try {
    const img = await loadImage(element.imageUrl);

    ctx.save();

    // Position et transformation
    ctx.translate(element.position.x, element.position.y);
    ctx.rotate((element.rotation * Math.PI) / 180);
    ctx.globalAlpha = element.opacity;

    // Dessiner l'image centrée sur sa position
    ctx.drawImage(
      img,
      -element.size.width / 2,
      -element.size.height / 2,
      element.size.width,
      element.size.height
    );

    ctx.restore();
  } catch (error) {
    console.error('Error drawing image element:', error);
    // Dessiner un rectangle de placeholder en cas d'erreur
    ctx.save();
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(
      element.position.x - element.size.width / 2,
      element.position.y - element.size.height / 2,
      element.size.width,
      element.size.height
    );
    ctx.restore();
  }
};

/**
 * Génère le thumbnail en base64 PNG
 */
export const generateThumbnailBase64 = async (options: Omit<ExportOptions, 'filename'>): Promise<string> => {
  const {
    width,
    height,
    backgroundColor,
    backgroundImage,
    elements,
  } = options;

  // Créer un canvas offscreen
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // 1. Dessiner le fond (couleur)
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // 2. Dessiner l'image de fond (si présente)
  if (backgroundImage) {
    try {
      const bgImg = await loadImage(backgroundImage);
      ctx.drawImage(bgImg, 0, 0, width, height);
    } catch (error) {
      console.error('Error loading background image:', error);
    }
  }

  // 3. Trier les éléments par zIndex (ascendant pour dessiner du fond vers le haut)
  const sortedElements = [...elements]
    .filter(el => el.visible !== false)
    .sort((a, b) => a.zIndex - b.zIndex);

  // 4. Dessiner tous les éléments
  for (const element of sortedElements) {
    if (element.type === 'text') {
      drawTextElement(ctx, element as TextElement);
    } else if (element.type === 'image') {
      await drawImageElement(ctx, element as ImageElement);
    }
  }

  // 5. Retourner en base64
  return canvas.toDataURL('image/png');
};

/**
 * Exporte le thumbnail en PNG et déclenche le téléchargement
 */
export const exportThumbnail = async (options: ExportOptions): Promise<void> => {
  const {
    width,
    height,
    backgroundColor,
    backgroundImage,
    elements,
    filename = 'thumbnail.png',
  } = options;

  // Créer un canvas offscreen
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // 1. Dessiner le fond (couleur)
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // 2. Dessiner l'image de fond (si présente)
  if (backgroundImage) {
    try {
      const bgImg = await loadImage(backgroundImage);
      ctx.drawImage(bgImg, 0, 0, width, height);
    } catch (error) {
      console.error('Error loading background image:', error);
    }
  }

  // 3. Trier les éléments par zIndex (ascendant pour dessiner du fond vers le haut)
  const sortedElements = [...elements]
    .filter(el => el.visible !== false) // Ignorer les éléments masqués
    .sort((a, b) => a.zIndex - b.zIndex);

  // 4. Dessiner tous les éléments
  for (const element of sortedElements) {
    if (element.type === 'text') {
      drawTextElement(ctx, element as TextElement);
    } else if (element.type === 'image') {
      await drawImageElement(ctx, element as ImageElement);
    }
  }

  // 5. Convertir en blob et télécharger
  canvas.toBlob((blob) => {
    if (!blob) {
      console.error('Failed to create blob');
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    // Nettoyer
    URL.revokeObjectURL(url);
  }, 'image/png');
};

/**
 * Génère un nom de fichier basé sur le titre de la vidéo
 */
export const generateThumbnailFilename = (videoTitle: string): string => {
  const sanitized = videoTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const timestamp = new Date().getTime();
  return `thumbnail-${sanitized}-${timestamp}.png`;
};
