import React from 'react';
import { TextalignLeft, Image } from 'iconsax-react';

interface ElementAddButtonsProps {
  onAddText: () => void;
  onAddImage: () => void;
}

const ElementAddButtons: React.FC<ElementAddButtonsProps> = ({
  onAddText,
  onAddImage,
}) => {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-bold text-gray-900 mb-2">Ajouter des éléments</h3>
      <p className="text-xs text-gray-500 mb-3">
        Ajoutez du texte ou des images au canvas
      </p>

      <div className="grid grid-cols-2 gap-2">
        {/* Add Text Button */}
        <button
          onClick={onAddText}
          className="flex flex-col items-center gap-2 p-3 rounded-lg border-2 border-dashed border-purple-300 bg-purple-50 hover:border-purple-500 hover:bg-purple-100 transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-500 group-hover:bg-purple-600 flex items-center justify-center transition-colors">
            <TextalignLeft size={20} variant="Bold" color="#FFFFFF" />
          </div>
          <span className="text-xs font-semibold text-purple-900">
            Texte
          </span>
        </button>

        {/* Add Image Button */}
        <button
          onClick={onAddImage}
          className="flex flex-col items-center gap-2 p-3 rounded-lg border-2 border-dashed border-pink-300 bg-pink-50 hover:border-pink-500 hover:bg-pink-100 transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-pink-500 group-hover:bg-pink-600 flex items-center justify-center transition-colors">
            <Image size={20} variant="Bold" color="#FFFFFF" />
          </div>
          <span className="text-xs font-semibold text-pink-900">
            Image
          </span>
        </button>
      </div>
    </div>
  );
};

export default ElementAddButtons;
