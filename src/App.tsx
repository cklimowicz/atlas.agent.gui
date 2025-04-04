import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Footer from './components/Footer';
import TestScenarioForm from './components/TestScenarioForm';
import { loadCertificates } from './config/https-agent';

function App() {
  // Dark mode toggle
  useEffect(() => {
    const darkModeToggle = document.getElementById('high-contrast-toggle');
    
    const toggleDarkMode = () => {
      document.body.classList.toggle('dark-mode');
      localStorage.setItem('dark-mode', document.body.classList.contains('dark-mode').toString());
    };
    
    // Check if dark mode was previously enabled
    const savedDarkMode = localStorage.getItem('dark-mode');
    if (savedDarkMode === 'true') {
      document.body.classList.add('dark-mode');
    }
    
    darkModeToggle?.addEventListener('click', toggleDarkMode);
    
    return () => {
      darkModeToggle?.removeEventListener('click', toggleDarkMode);
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
