import React, { useRef } from 'react';
import { NavLink, Outlet } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { Logout } from 'iconsax-react';
import ConfirmationModal from '../modals/confirmation-modal';
import type { ModalRef } from '../../types/modal-ref';

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const logoutModalRef = useRef<ModalRef>(null);

  const handleLogoutClick = () => {
    logoutModalRef.current?.open();
  };

  const handleLogoutConfirm = () => {
    logout();
  };

  const navItems = [
    {
      path: '/dashboard',
      label: 'Accueil',
    },
    {
      path: '/dashboard/extracts/new',
      label: 'New Extract',
    },
    {
      path: '/dashboard/extracts',
      label: 'All Extracts',
    },
    {
      path: '/dashboard/themes',
      label: 'Themes',
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="shadow-lg" style={{ backgroundColor: '#272530' }}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div>
              <h1 className="text-xl font-bold text-white">Solo Base Notes</h1>
              <p className="text-xs text-gray-400">Anime Extracts Manager</p>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/dashboard'}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white font-medium'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* User Section */}
            <div className="flex items-center gap-4">
              {user?.avatar && (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <button
                onClick={handleLogoutClick}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Logout size={18} variant="Outline" color="#F87171" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        ref={logoutModalRef}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        type="danger"
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
};

export default DashboardLayout;
