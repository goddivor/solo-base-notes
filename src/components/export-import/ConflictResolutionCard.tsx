import { Warning2, ArrowRight } from "iconsax-react";

type ConflictResolution = "REUSE_EXISTING" | "CREATE_DUPLICATE" | "SKIP";

interface ConflictItem {
  id: string | null;
  name: string;
  description: string | null;
  color: string | null;
}

interface ImportConflict {
  type: "THEME_NAME_EXISTS" | "THEME_GROUP_NAME_EXISTS";
  importedItem: ConflictItem;
  existingItem: ConflictItem;
}

interface ConflictResolutionCardProps {
  conflict: ImportConflict;
  resolution: ConflictResolution;
  onResolutionChange: (resolution: ConflictResolution) => void;
}

export default function ConflictResolutionCard({
  conflict,
  resolution,
  onResolutionChange,
}: ConflictResolutionCardProps) {
  const typeLabel =
    conflict.type === "THEME_NAME_EXISTS" ? "Mini-thème" : "Groupe de thèmes";

  return (
    <div className="border border-yellow-200 rounded-lg overflow-hidden bg-white">
      {/* Header */}
      <div className="px-4 py-3 bg-yellow-50 flex items-center space-x-2">
        <Warning2 size={18} color="#F59E0B" variant="Bold" />
        <span className="text-sm font-medium text-yellow-800">
          Conflit de {typeLabel.toLowerCase()}
        </span>
      </div>

      {/* Comparison */}
      <div className="p-4">
        <div className="flex items-center space-x-4">
          {/* Imported Item */}
          <div className="flex-1 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-600 font-medium mb-1">À importer</p>
            <div className="flex items-center space-x-2">
              {conflict.importedItem.color && (
                <div
                  className="w-4 h-4 rounded-full border border-gray-200"
                  style={{ backgroundColor: conflict.importedItem.color }}
                />
              )}
              <span className="font-medium text-gray-900 truncate">
                {conflict.importedItem.name}
              </span>
            </div>
            {conflict.importedItem.description && (
              <p className="text-xs text-gray-500 mt-1 truncate">
                {conflict.importedItem.description}
              </p>
            )}
          </div>

          {/* Arrow */}
          <ArrowRight size={20} color="#9CA3AF" />

          {/* Existing Item */}
          <div className="flex-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 font-medium mb-1">Existant</p>
            <div className="flex items-center space-x-2">
              {conflict.existingItem.color && (
                <div
                  className="w-4 h-4 rounded-full border border-gray-200"
                  style={{ backgroundColor: conflict.existingItem.color }}
                />
              )}
              <span className="font-medium text-gray-900 truncate">
                {conflict.existingItem.name}
              </span>
            </div>
            {conflict.existingItem.description && (
              <p className="text-xs text-gray-500 mt-1 truncate">
                {conflict.existingItem.description}
              </p>
            )}
          </div>
        </div>

        {/* Resolution Options */}
        <div className="mt-4 space-y-2">
          <label className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="radio"
              name={`conflict-${conflict.importedItem.id}`}
              checked={resolution === "REUSE_EXISTING"}
              onChange={() => onResolutionChange("REUSE_EXISTING")}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900">
                Utiliser l'existant
              </span>
              <p className="text-xs text-gray-500">
                Les extraits importés seront liés au {typeLabel.toLowerCase()}{" "}
                existant
              </p>
            </div>
          </label>

          <label className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="radio"
              name={`conflict-${conflict.importedItem.id}`}
              checked={resolution === "CREATE_DUPLICATE"}
              onChange={() => onResolutionChange("CREATE_DUPLICATE")}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900">
                Créer un doublon
              </span>
              <p className="text-xs text-gray-500">
                Un nouveau {typeLabel.toLowerCase()} sera créé avec le suffixe
                "(copie)"
              </p>
            </div>
          </label>

          <label className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="radio"
              name={`conflict-${conflict.importedItem.id}`}
              checked={resolution === "SKIP"}
              onChange={() => onResolutionChange("SKIP")}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900">Ignorer</span>
              <p className="text-xs text-gray-500">
                Ce {typeLabel.toLowerCase()} ne sera pas importé
              </p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
