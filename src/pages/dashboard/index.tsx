import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Solo Base Notes</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {user?.avatar && (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to your Dashboard! 👋
          </h2>
          <p className="text-gray-600 mb-8">
            Your anime extracts management system is ready. Let's build the features!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">Create Extracts</h3>
              <p className="text-gray-600 text-sm">Add new anime extracts with characters and timing</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="text-4xl mb-4">🏷️</div>
              <h3 className="text-xl font-semibold mb-2">Manage Themes</h3>
              <p className="text-gray-600 text-sm">Organize extracts by video themes</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">View Library</h3>
              <p className="text-gray-600 text-sm">Browse all your saved extracts</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
