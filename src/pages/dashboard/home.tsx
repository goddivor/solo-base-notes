import React from 'react';
import { Link } from 'react-router';
import { DocumentText1, Tag, Book } from 'iconsax-react';

const DashboardHome: React.FC = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to your Dashboard! 👋
        </h1>
        <p className="text-gray-600">
          Manage your anime extracts for your YouTube videos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/dashboard/extracts/new"
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 group"
        >
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
            <DocumentText1 size={24} variant="Bulk" color="#4F46E5" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900">Create Extract</h3>
          <p className="text-gray-600 text-sm">
            Add new anime extracts with characters and timing
          </p>
        </Link>

        <Link
          to="/dashboard/themes"
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 group"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
            <Tag size={24} variant="Bulk" color="#9333EA" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900">Manage Themes</h3>
          <p className="text-gray-600 text-sm">
            Organize extracts by video themes
          </p>
        </Link>

        <Link
          to="/dashboard/extracts"
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 group"
        >
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
            <Book size={24} variant="Bulk" color="#16A34A" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900">View Library</h3>
          <p className="text-gray-600 text-sm">
            Browse all your saved extracts
          </p>
        </Link>
      </div>
    </div>
  );
};

export default DashboardHome;
