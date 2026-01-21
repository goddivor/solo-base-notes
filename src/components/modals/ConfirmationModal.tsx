import React from 'react';
import { CloseCircle, InfoCircle } from 'iconsax-react';
import Portal from '../Portal';
import { useTheme } from '../../context/theme-context';
import { cn } from '../../lib/utils';

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
  const { theme } = useTheme();

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'error':
        return {
          bgColor: theme === "dark" ? 'bg-red-500/20' : 'bg-red-100',
          iconColor: '#DC2626',
          buttonColor: 'bg-red-600 hover:bg-red-700',
        };
      case 'info':
        return {
          bgColor: theme === "dark" ? 'bg-purple-500/20' : 'bg-blue-100',
          iconColor: theme === "dark" ? '#A855F7' : '#2563EB',
          buttonColor: 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400',
        };
      case 'warning':
      default:
        return {
          bgColor: theme === "dark" ? 'bg-yellow-500/20' : 'bg-yellow-100',
          iconColor: '#F59E0B',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <Portal>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
        style={{ zIndex: 9999 }}
        onClick={onClose}
      >
        <div
          className={cn(
            "rounded-2xl shadow-xl max-w-md w-full p-6",
            theme === "dark" ? "bg-[#12121a]" : "bg-white"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 ${styles.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <InfoCircle size={24} variant="Bulk" color={styles.iconColor} />
            </div>
            <div className="flex-1">
              <h3 className={cn(
                "text-lg font-bold mb-2",
                theme === "dark" ? "text-white" : "text-gray-900"
              )}>{title}</h3>
              <p className={cn(
                "text-sm",
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              )}>{message}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "transition-colors",
                theme === "dark" ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <CloseCircle size={24} color={theme === "dark" ? "#6B7280" : "#9CA3AF"} />
            </button>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-2 ${styles.buttonColor} text-white rounded-xl font-medium transition-colors`}
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
