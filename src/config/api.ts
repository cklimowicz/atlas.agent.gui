/**
 * API Configuration
 * This file contains all API-related configuration settings.
 * Modify these values to change API endpoints without changing component code.
 */

// Base API URL - Using HTTPS for localhost
export const API_BASE_URL = 'https://localhost:8000';

// API Endpoints
export const API_ENDPOINTS = {
  // Test scenario submission endpoint
  SUBMIT_TEST_SCENARIO: `${API_BASE_URL}/docs/runs/programmatic`,
};

// API Request Configuration
export const API_CONFIG = {
  // Default request timeout in milliseconds
  DEFAULT_TIMEOUT: 30000,
  
  // Default headers for API requests
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
};

// Local Storage Configuration
export const STORAGE_CONFIG = {
  // Prefix for test scenario configurations in local storage
  TEST_SCENARIO_PREFIX: 'test-scenario-',
};

// Certificate status
export const CERT_STATUS = {
  // This will be updated at runtime based on certificate availability
  CERTS_LOADED: false,
  
  // Update certificate status
  updateStatus: (status: boolean) => {
    CERT_STATUS.CERTS_LOADED = status;
  }
};

// Function to check if certificates are available
export const checkCertificates = async () => {
  try {
    // Check if cert files exist by attempting to fetch them
    const certResponse = await fetch('/cert/cert.pem', { method: 'HEAD' });
    const keyResponse = await fetch('/cert/key.pem', { method: 'HEAD' });
    
    const certsAvailable = certResponse.ok && keyResponse.ok;
    CERT_STATUS.updateStatus(certsAvailable);
    
    return certsAvailable;
  } catch (error) {
    console.warn('Certificate check failed:', error);
    CERT_STATUS.updateStatus(false);
    return false;
  }
};
