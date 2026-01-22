// src/components/modals/confirmation-modal.tsx
import { forwardRef, useImperativeHandle, useState } from "react";
import { Trash, Warning2, CloseCircle } from "iconsax-react";
import Button from "../actions/button";
import type { ModalRef } from "../../types/modal-ref";
import { useTheme } from "../../context/theme-context";
import { cn } from "../../lib/utils";

interface ConfirmationModalProps {
  title?: string;
  message?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm?: () => void;
  onCancel?: () => void;
}

const ConfirmationModal = forwardRef<ModalRef, ConfirmationModalProps>(
  (
    {
      title = "Êtes-vous sûr ?",
      message = "Cette action ne peut pas être annulée.",
      description,
      confirmText = "Confirmer",
      cancelText = "Annuler",
      type = "danger",
      onConfirm,
      onCancel,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const { theme } = useTheme();

    useImperativeHandle(ref, () => ({
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }));

    const handleConfirm = () => {
      onConfirm?.();
      setIsOpen(false);
    };

    const handleCancel = () => {
      onCancel?.();
      setIsOpen(false);
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleCancel();
      }
    };

    if (!isOpen) return null;

    const getTypeConfig = () => {
      switch (type) {
        case 'danger':
          return {
            icon: <Trash size={24} color="#f87171" variant="Bold" />,
            iconBg: theme === "dark" ? 'bg-red-500/20' : 'bg-red-100',
            confirmBg: 'bg-red-600 hover:bg-red-700',
            borderColor: theme === "dark" ? 'border-red-500/20' : 'border-red-200',
          };
        case 'warning':
          return {
            icon: <Warning2 size={24} color="#fbbf24" variant="Bold" />,
            iconBg: theme === "dark" ? 'bg-yellow-500/20' : 'bg-yellow-100',
            confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
            borderColor: theme === "dark" ? 'border-yellow-500/20' : 'border-yellow-200',
          };
        case 'info':
          return {
            icon: <CloseCircle size={24} color="#60a5fa" variant="Bold" />,
            iconBg: theme === "dark" ? 'bg-blue-500/20' : 'bg-blue-100',
            confirmBg: 'bg-blue-600 hover:bg-blue-700',
            borderColor: theme === "dark" ? 'border-blue-500/20' : 'border-blue-200',
          };
        default:
          return {
            icon: <Warning2 size={24} color="#9ca3af" variant="Bold" />,
            iconBg: theme === "dark" ? 'bg-gray-500/20' : 'bg-gray-100',
            confirmBg: 'bg-gray-600 hover:bg-gray-700',
            borderColor: theme === "dark" ? 'border-gray-700' : 'border-gray-200',
          };
      }
    };

    const typeConfig = getTypeConfig();

    return (
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
      >
        <div className={cn(
          "rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border",
          theme === "dark"
            ? "bg-[#1a1a25] border-gray-700"
            : "bg-white border-gray-200"
        )}>
          {/* Header */}
          <div className={cn("p-6 border-b", typeConfig.borderColor)}>
            <div className="flex items-center space-x-4">
              <div className={cn("p-3 rounded-xl", typeConfig.iconBg)}>
                {typeConfig.icon}
              </div>
              <div className="flex-1">
                <h3 className={cn(
                  "text-lg font-semibold",
                  theme === "dark" ? "text-white" : "text-gray-900"
                )}>
                  {title}
                </h3>
                <p className={cn(
                  "text-sm mt-1",
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                )}>
                  {message}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          {description && (
            <div className="p-6">
              <p className={cn(
                "text-sm leading-relaxed",
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              )}>
                {description}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className={cn(
            "p-6 flex items-center justify-end space-x-3",
            theme === "dark" ? "bg-white/5" : "bg-gray-50"
          )}>
            <Button
              onClick={handleCancel}
              className={cn(
                "px-4 py-2 border rounded-xl transition-colors",
                theme === "dark"
                  ? "border-gray-600 text-gray-300 hover:bg-white/10"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              )}
            >
              {cancelText}
            </Button>
            <Button
              onClick={handleConfirm}
              className={cn(
                "px-4 py-2 text-white rounded-xl transition-colors",
                typeConfig.confirmBg
              )}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

ConfirmationModal.displayName = 'ConfirmationModal';

export default ConfirmationModal;