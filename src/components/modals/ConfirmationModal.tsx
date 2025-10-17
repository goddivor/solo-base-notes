import React from 'react';
import { CloseCircle, InfoCircle } from 'iconsax-react';
import Portal from '../Portal';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'error';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'warning',
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'error':
        return {
          bgColor: 'bg-red-100',
          iconColor: '#DC2626',
          buttonColor: 'bg-red-600 hover:bg-red-700',
        };
      case 'info':
        return {
          bgColor: 'bg-blue-100',
          iconColor: '#2563EB',
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
        };
      case 'warning':
      default:
        return {
          bgColor: 'bg-yellow-100',
          iconColor: '#F59E0B',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
        };
    }
  };

  const styles = getTypeStyles();

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
              <InfoCircle size={24} variant="Bulk" color={styles.iconColor} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-600 text-sm">{message}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <CloseCircle size={24} color="currentColor" />
            </button>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-2 ${styles.buttonColor} text-white rounded-lg font-medium transition-colors`}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default ConfirmationModal;
