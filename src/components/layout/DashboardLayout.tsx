import { useRef } from "react";
import { NavLink, Outlet } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../context/theme-context";
import {
  Logout,
  Home2,
  DocumentText1,
  Category,
  VideoPlay,
  Link21,
  Sun1,
  Moon,
  Setting2,
} from "iconsax-react";
import ConfirmationModal from "../modals/confirmation-modal";
import type { ModalRef } from "../../types/modal-ref";
import { cn } from "../../lib/utils";

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const logoutModalRef = useRef<ModalRef>(null);

  const handleLogoutClick = () => {
    logoutModalRef.current?.open();
  };

  const handleLogoutConfirm = () => {
    logout();
  };

  const navItems = [
    {
      path: "/dashboard",
      label: "Accueil",
      icon: Home2,
      end: true,
    },
    {
      path: "/dashboard/extracts",
      label: "Extraits",
      icon: DocumentText1,
      end: true,
    },
    {
      path: "/dashboard/themes",
      label: "Thèmes",
      icon: Category,
      end: true,
    },
    {
      path: "/dashboard/videos",
      label: "Vidéos",
      icon: VideoPlay,
      end: true,
    },
    {
      path: "/dashboard/published-videos",
      label: "Publiées",
      icon: Link21,
      end: true,
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-col min-h-screen transition-colors duration-300",
        theme === "dark" ? "bg-[#0a0a0f]" : "bg-gray-50"
      )}
    >
      {/* Header */}
      <header
        className={cn(
          "sticky top-0 z-50 backdrop-blur-xl border-b transition-colors duration-300",
          theme === "dark"
            ? "bg-[#0a0a0f]/80 border-gray-800"
            : "bg-white/80 border-gray-200"
        )}
      >
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <NavLink to="/dashboard" className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  "bg-gradient-to-br from-purple-500 to-cyan-500"
                )}
              >
                <span className="text-white font-bold text-lg">Q</span>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
                  QuoteForge
                </h1>
                <p
                  className={cn(
                    "text-[10px] leading-none",
                    theme === "dark" ? "text-gray-500" : "text-gray-400"
                  )}
                >
                  Studio de contenu anime
                </p>
              </div>
            </NavLink>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/25"
                          : theme === "dark"
                          ? "text-gray-400 hover:text-white hover:bg-white/5"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={18}
                          variant={isActive ? "Bold" : "Outline"}
                          color={isActive ? "#ffffff" : theme === "dark" ? "#9ca3af" : "#4b5563"}
                        />
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={cn(
                  "p-2.5 rounded-xl transition-all duration-200",
                  theme === "dark"
                    ? "text-gray-400 hover:text-white hover:bg-white/5"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
                title={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
              >
                {theme === "dark" ? (
                  <Sun1 size={20} color="#9ca3af" variant="Bold" />
                ) : (
                  <Moon size={20} color="#4b5563" variant="Bold" />
                )}
              </button>

              {/* Settings */}
              <button
                className={cn(
                  "p-2.5 rounded-xl transition-all duration-200",
                  theme === "dark"
                    ? "text-gray-400 hover:text-white hover:bg-white/5"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
                title="Paramètres"
              >
                <Setting2
                  size={20}
                  color={theme === "dark" ? "#9ca3af" : "#4b5563"}
                  variant="Outline"
                />
              </button>

              {/* User */}
              <div className="flex items-center gap-3 ml-2">
                {user?.avatar && (
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className={cn(
                        "w-9 h-9 rounded-xl object-cover ring-2 transition-all",
                        theme === "dark"
                          ? "ring-gray-700 hover:ring-purple-500/50"
                          : "ring-gray-200 hover:ring-purple-300"
                      )}
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0a0a0f]" />
                  </div>
                )}
                <button
                  onClick={handleLogoutClick}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200",
                    theme === "dark"
                      ? "text-red-400 hover:bg-red-500/10"
                      : "text-red-500 hover:bg-red-50"
                  )}
                >
                  <Logout size={18} variant="Outline" color={theme === "dark" ? "#f87171" : "#ef4444"} />
                  <span className="hidden sm:inline">Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden px-4 pb-3 overflow-x-auto">
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                      isActive
                        ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white"
                        : theme === "dark"
                        ? "text-gray-400 bg-white/5"
                        : "text-gray-600 bg-gray-100"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={14}
                        variant={isActive ? "Bold" : "Outline"}
                        color={isActive ? "#ffffff" : theme === "dark" ? "#9ca3af" : "#4b5563"}
                      />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        ref={logoutModalRef}
        title="Déconnexion"
        message="Êtes-vous sûr de vouloir vous déconnecter ?"
        confirmText="Déconnexion"
        cancelText="Annuler"
        type="danger"
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
};

export default DashboardLayout;
