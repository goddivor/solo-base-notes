import React from 'react';
import { CloseCircle, Danger, InfoCircle, TickCircle } from 'iconsax-react';
import Portal from '../Portal';
import { useTheme } from '../../context/theme-context';
import { cn } from '../../lib/utils';

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
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  loading = false,
}) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          bgColor: theme === "dark" ? 'bg-red-500/20' : 'bg-red-100',
          iconColor: '#DC2626',
          icon: Danger,
          buttonColor: 'bg-red-600 hover:bg-red-700',
        };
      case 'info':
        return {
          bgColor: theme === "dark" ? 'bg-purple-500/20' : 'bg-blue-100',
          iconColor: theme === "dark" ? '#A855F7' : '#2563EB',
          icon: InfoCircle,
          buttonColor: 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400',
        };
      case 'warning':
      default:
        return {
          bgColor: theme === "dark" ? 'bg-yellow-500/20' : 'bg-yellow-100',
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
              <Icon size={24} variant="Bulk" color={styles.iconColor} />
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
              disabled={loading}
              className={cn(
                "transition-colors disabled:opacity-50",
                theme === "dark" ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <CloseCircle size={24} color={theme === "dark" ? "#6B7280" : "#9CA3AF"} />
            </button>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={cn(
                "px-6 py-2 border-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                theme === "dark"
                  ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              )}
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`flex items-center gap-2 px-6 py-2 ${styles.buttonColor} text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  En cours...
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
