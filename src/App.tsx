import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Footer from './components/Footer';
import TestScenarioForm from './components/TestScenarioForm';
import { loadCertificates } from './config/https-agent';

function App() {
  // High contrast mode toggle
  useEffect(() => {
    const highContrastToggle = document.getElementById('high-contrast-toggle');
    
    const toggleHighContrast = () => {
      document.body.classList.toggle('high-contrast');
      localStorage.setItem('high-contrast', document.body.classList.contains('high-contrast').toString());
    };
    
    // Check if high contrast mode was previously enabled
    const savedHighContrast = localStorage.getItem('high-contrast');
    if (savedHighContrast === 'true') {
      document.body.classList.add('high-contrast');
    }
    
    highContrastToggle?.addEventListener('click', toggleHighContrast);
    
    return () => {
      highContrastToggle?.removeEventListener('click', toggleHighContrast);
    };
  }, []);

  // Add a warning about HTTPS certificate issues
  useEffect(() => {
    // Check if we're using HTTPS on localhost
    if (window.location.protocol === 'https:' && window.location.hostname === 'localhost') {
      console.warn(
        'You are using HTTPS on localhost. If you encounter API connection issues, ' +
        'try visiting the API URL directly first to accept any certificate warnings: ' +
        'https://localhost:8000/docs'
      );
    }
  }, []);

  // Load certificates on app start
  useEffect(() => {
    const initCertificates = async () => {
      try {
        await loadCertificates();
      } catch (error) {
        console.warn('Failed to load certificates:', error);
      }
    };
    
    initCertificates();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Toaster position="top-right" />
      <Header />
      <main className="flex-grow py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <TestScenarioForm />
      </main>
      <Footer />
    </div>
  );
}

export default App;
