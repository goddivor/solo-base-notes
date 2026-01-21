import React from 'react';
import { TextalignLeft, Image } from 'iconsax-react';
import { useTheme } from '../../context/theme-context';
import { cn } from '../../lib/utils';

interface ElementAddButtonsProps {
  onAddText: () => void;
  onAddImage: () => void;
}

const ElementAddButtons: React.FC<ElementAddButtonsProps> = ({
  onAddText,
  onAddImage,
}) => {
  const { theme } = useTheme();

  return (
    <div className="mb-6">
      <h3 className={cn(
        "text-sm font-bold mb-2",
        theme === "dark" ? "text-white" : "text-gray-900"
      )}>Ajouter des éléments</h3>
      <p className={cn(
        "text-xs mb-3",
        theme === "dark" ? "text-gray-400" : "text-gray-500"
      )}>
        Ajoutez du texte ou des images au canvas
      </p>

      <div className="grid grid-cols-2 gap-2">
        {/* Add Text Button */}
        <button
          onClick={onAddText}
          className={cn(
            "flex flex-col items-center gap-2 p-3 rounded-lg border-2 border-dashed transition-all group",
            theme === "dark"
              ? "border-purple-500/50 bg-purple-500/10 hover:border-purple-500 hover:bg-purple-500/20"
              : "border-purple-300 bg-purple-50 hover:border-purple-500 hover:bg-purple-100"
          )}
        >
          <div className="w-10 h-10 rounded-lg bg-purple-500 group-hover:bg-purple-600 flex items-center justify-center transition-colors">
            <TextalignLeft size={20} variant="Bold" color="#FFFFFF" />
          </div>
          <span className={cn(
            "text-xs font-semibold",
            theme === "dark" ? "text-purple-300" : "text-purple-900"
          )}>
            Texte
          </span>
        </button>

        {/* Add Image Button */}
        <button
          onClick={onAddImage}
          className={cn(
            "flex flex-col items-center gap-2 p-3 rounded-lg border-2 border-dashed transition-all group",
            theme === "dark"
              ? "border-cyan-500/50 bg-cyan-500/10 hover:border-cyan-500 hover:bg-cyan-500/20"
              : "border-pink-300 bg-pink-50 hover:border-pink-500 hover:bg-pink-100"
          )}
        >
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
            theme === "dark"
              ? "bg-cyan-500 group-hover:bg-cyan-600"
              : "bg-pink-500 group-hover:bg-pink-600"
          )}>
            <Image size={20} variant="Bold" color="#FFFFFF" />
          </div>
          <span className={cn(
            "text-xs font-semibold",
            theme === "dark" ? "text-cyan-300" : "text-pink-900"
          )}>
            Image
          </span>
        </button>
      </div>
    </div>
  );
};

export default ElementAddButtons;
