import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Atlas Code-Gen
          </p>
          <div className="mt-2 md:mt-0 flex space-x-4">
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
              Documentation
            </a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
              Support
            </a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
