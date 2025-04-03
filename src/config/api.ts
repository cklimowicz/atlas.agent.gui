/**
 * API Configuration
 * This file contains all API-related configuration settings.
 * Modify these values to change API endpoints without changing component code.
 */

// Base API URL
export const API_BASE_URL = 'http://localhost:8000';

// API Endpoints
export const API_ENDPOINTS = {
  // Test scenario submission endpoint
  SUBMIT_TEST_SCENARIO: `${API_BASE_URL}/runs/programmatic`,
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
