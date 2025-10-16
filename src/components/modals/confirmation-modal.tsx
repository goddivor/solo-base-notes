// src/components/modals/confirmation-modal.tsx
import { forwardRef, useImperativeHandle, useState } from "react";
import { Trash, Warning2, CloseCircle } from "iconsax-react";
import Button from "../actions/button";
import type { ModalRef } from "../../types/modal-ref";

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
            icon: <Trash size={24} color="#DC2626" variant="Bold" />,
            iconBg: 'bg-red-100',
            confirmBg: 'bg-red-600 hover:bg-red-700',
            borderColor: 'border-red-200',
          };
        case 'warning':
          return {
            icon: <Warning2 size={24} color="#F59E0B" variant="Bold" />,
            iconBg: 'bg-yellow-100',
            confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
            borderColor: 'border-yellow-200',
          };
        case 'info':
          return {
            icon: <CloseCircle size={24} color="#3B82F6" variant="Bold" />,
            iconBg: 'bg-blue-100',
            confirmBg: 'bg-blue-600 hover:bg-blue-700',
            borderColor: 'border-blue-200',
          };
        default:
          return {
            icon: <Warning2 size={24} color="#6B7280" variant="Bold" />,
            iconBg: 'bg-gray-100',
            confirmBg: 'bg-gray-600 hover:bg-gray-700',
            borderColor: 'border-gray-200',
          };
      }
    };

    const typeConfig = getTypeConfig();

    return (
      <div
        className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
          {/* Header */}
          <div className={`p-6 border-b ${typeConfig.borderColor}`}>
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${typeConfig.iconBg}`}>
                {typeConfig.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {message}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          {description && (
            <div className="p-6">
              <p className="text-sm text-gray-700 leading-relaxed">
                {description}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="p-6 bg-gray-50 flex items-center justify-end space-x-3">
            <Button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {cancelText}
            </Button>
            <Button
              onClick={handleConfirm}
              className={`px-4 py-2 text-white rounded-lg transition-colors ${typeConfig.confirmBg}`}
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