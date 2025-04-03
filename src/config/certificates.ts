/**
 * Certificate Configuration
 * This file contains all certificate-related configuration settings.
 * Handles certificate status and availability checking.
 */

import { loadCertificates } from './https-agent';

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
// This function provides a runtime check for certificates
// Note: Initial certificate check for server startup is done in vite.config.ts
export const checkCertificates = async () => {
  try {
    // Use the existing loadCertificates function from https-agent.ts
    const certificates = await loadCertificates();
    
    const certsAvailable = certificates !== null;
    CERT_STATUS.updateStatus(certsAvailable);
    
    return certsAvailable;
  } catch (error) {
    console.warn('Certificate check failed:', error);
    CERT_STATUS.updateStatus(false);
    return false;
  }
}; 