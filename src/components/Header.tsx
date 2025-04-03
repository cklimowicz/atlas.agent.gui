import React from 'react';
import { TestTube2 } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <TestTube2 size={28} className="text-blue-600 mr-2" />
            <h1 className="text-xl font-bold text-gray-900">Test Scenario Management</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label="Toggle high contrast mode"
              id="high-contrast-toggle"
            >
              High Contrast
            </button>
            <span className="text-sm text-gray-500">v1.0.0</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
