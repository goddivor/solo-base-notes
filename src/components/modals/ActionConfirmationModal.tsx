import React from 'react';
import { CloseCircle, Danger, InfoCircle, TickCircle } from 'iconsax-react';
import Portal from '../Portal';

interface ActionConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'danger';
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

const ActionConfirmationModal: React.FC<ActionConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'danger',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          bgColor: 'bg-red-100',
          iconColor: '#DC2626',
          icon: Danger,
          buttonColor: 'bg-red-600 hover:bg-red-700',
        };
      case 'info':
        return {
          bgColor: 'bg-blue-100',
          iconColor: '#2563EB',
          icon: InfoCircle,
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
        };
      case 'warning':
      default:
        return {
          bgColor: 'bg-yellow-100',
          iconColor: '#F59E0B',
          icon: InfoCircle,
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
        };
    }
  };

  const styles = getTypeStyles();
  const Icon = styles.icon;

  return (
    <Portal>
      <div
        className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center p-4"
        style={{ zIndex: 9999 }}
        onClick={onClose}
      >
        <div
          className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 ${styles.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <Icon size={24} variant="Bulk" color={styles.iconColor} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-600 text-sm">{message}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <CloseCircle size={24} color="currentColor" />
            </button>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`flex items-center gap-2 px-6 py-2 ${styles.buttonColor} text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <TickCircle size={20} variant="Bulk" color="#FFFFFF" />
                  {confirmText}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default ActionConfirmationModal;
