import React, { useEffect, useState } from 'react';
import { TestTube2, Moon, ShieldCheck, ShieldAlert } from 'lucide-react';
import { checkCertificates } from '../config/https-agent';

const Header: React.FC = () => {
  const [certStatus, setCertStatus] = useState<'loaded' | 'missing' | 'unknown'>('unknown');

  // Sprawdzenie statusu certyfikatów
  useEffect(() => {
    const checkCertificateStatus = async () => {
      try {
        const certsAvailable = await checkCertificates();
        setCertStatus(certsAvailable ? 'loaded' : 'missing');
      } catch (error) {
        console.warn('Certificate check failed:', error);
        setCertStatus('missing');
      }
    };
    
    checkCertificateStatus();
    
    const handleStorageChange = () => {
      const status = window.localStorage.getItem('cert_status');
      if (status === 'loaded') {
        setCertStatus('loaded');
      } else if (status === 'missing') {
        setCertStatus('missing');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <TestTube2 size={28} className="text-blue-600 mr-2" />
            <h1 className="text-xl font-bold text-gray-900">Atlas Code-Gen</h1>
          </div>
          <div className="flex items-center space-x-4">
            {certStatus === 'loaded' ? (
              <div className="text-sm font-medium flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700">
                <ShieldCheck size={16} className="mr-1" /> 
                Certyfikaty Załadowane
              </div>
            ) : certStatus === 'missing' ? (
              <div className="text-sm font-medium flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-700">
                <ShieldAlert size={16} className="mr-1" /> 
                Brak Certyfikatów
              </div>
            ) : null}
            <button
              type="button"
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label="Toggle dark mode"
              id="high-contrast-toggle"
            >
              <Moon size={16} className="mr-1" /> Dark Mode
            </button>
            <span className="text-sm text-gray-500">v1.0.0</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
