/**
 * HTTPS Agent Configuration
 * 
 * This module provides HTTPS agent configuration for secure API calls
 * using certificate files from the public directory.
 */

// In a browser environment, we need to handle certificates differently
// than in Node.js. We'll create a utility to fetch and use the certificates.

import { STORAGE_KEYS } from './ui';

// Function to load certificate files
export const loadCertificates = async () => {
  try {
    // Attempt to access certificate files from the public directory
    const certResponse = await fetch('/cert.pem', {
      headers: { 'Cache-Control': 'no-cache' },
      method: 'GET'
    });
    const keyResponse = await fetch('/key.pem', {
      headers: { 'Cache-Control': 'no-cache' },
      method: 'GET'
    });
    
    if (!certResponse.ok || !keyResponse.ok) {
      console.error('Failed to load certificate files', 
        certResponse.status, keyResponse.status);
      return null;
    }
    
    const cert = await certResponse.text();
    const key = await keyResponse.text();
    
    return { cert, key };
  } catch (error) {
    console.error('Error loading certificates:', error);
    return null;
  }
};

// Function to check if certificates are available
export const checkCertificates = async (): Promise<boolean> => {
  const certificates = await loadCertificates();
  const certsAvailable = certificates !== null;
  
  // Update localStorage status
  if (certsAvailable) {
    window.localStorage.setItem(STORAGE_KEYS.CERT_STATUS, 'loaded');
  } else {
    window.localStorage.setItem(STORAGE_KEYS.CERT_STATUS, 'missing');
  }
  
  return certsAvailable;
};

// This will be used in the API calls
export const createSecureRequest = async (url: string, options: RequestInit = {}) => {
  try {
    // Add certificate handling logic
    const certificates = await loadCertificates();
    
    // If certificates are loaded, we can use them
    // For browser environments, we'll rely on the browser's handling of certificates
    // but we'll set a flag to indicate that certificates are available
    
    if (certificates) {
      // Update the CERT_STATUS in api.ts
      // This is done indirectly since we can't import/export circular dependencies
      window.localStorage.setItem('cert_status', 'loaded');
    } else {
      window.localStorage.setItem('cert_status', 'missing');
    }
    
    // Make the request with appropriate options
    const response = await fetch(url, {
      ...options,
      // In browser environments, we need to accept self-signed certificates
      // This is handled by the browser settings, not in code
    });
    
    return response;
  } catch (error) {
    console.error('Secure request failed:', error);
    throw error;
  }
};

export default { loadCertificates, createSecureRequest, checkCertificates };
