import React, { useEffect, useState } from 'react';
import { BrainCircuit, Moon, Sun, ShieldCheck, ShieldAlert } from 'lucide-react';
import { checkCertificates } from '../config/https-agent';
import { APP_INFO, STORAGE_KEYS, DOM_IDS, THEME } from '../config/ui';

const Header: React.FC = () => {
  const [certStatus, setCertStatus] = useState<'loaded' | 'missing' | 'unknown'>('unknown');
  const [isDarkMode, setIsDarkMode] = useState(false);

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
      const status = window.localStorage.getItem(STORAGE_KEYS.CERT_STATUS);
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

  // Sprawdzenie aktualnego trybu ciemnego/jasnego
  useEffect(() => {
    // Inicjalizacja stanu na podstawie zapisanej wartości
    const savedDarkMode = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
    setIsDarkMode(savedDarkMode === 'true');

    // Nasłuchiwanie na zmiany trybu
    const handleDarkModeChange = () => {
      setIsDarkMode(document.body.classList.contains('dark-mode'));
    };

    // Dodanie słuchacza na kliknięcia przycisku
    const darkModeToggle = document.getElementById(DOM_IDS.DARK_MODE_TOGGLE);
    darkModeToggle?.addEventListener('click', handleDarkModeChange);

    return () => {
      darkModeToggle?.removeEventListener('click', handleDarkModeChange);
    };
  }, []);

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BrainCircuit size={THEME.ICON_SIZES.MEDIUM} className={`${THEME.ICON_COLORS.PRIMARY} mr-2`} />
            <h1 className="text-xl font-bold text-gray-900">{APP_INFO.NAME}</h1>
          </div>
          <div className="flex items-center space-x-4">
            {certStatus === 'loaded' ? (
              <div className="text-sm font-medium flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700">
                <ShieldCheck size={THEME.ICON_SIZES.SMALL} className="mr-1" /> 
                Certyfikaty Załadowane
              </div>
            ) : certStatus === 'missing' ? (
              <div className="text-sm font-medium flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-700">
                <ShieldAlert size={THEME.ICON_SIZES.SMALL} className="mr-1" /> 
                Brak Certyfikatów
              </div>
            ) : null}
            <button
              type="button"
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label="Toggle dark mode"
              id={DOM_IDS.DARK_MODE_TOGGLE}
            >
              {isDarkMode ? (
                <Sun size={THEME.ICON_SIZES.SMALL} className="mr-1" />
              ) : (
                <Moon size={THEME.ICON_SIZES.SMALL} className="mr-1" />
              )}
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            <span className="text-sm text-gray-500">{APP_INFO.VERSION}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
