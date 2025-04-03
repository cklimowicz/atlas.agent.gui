/**
 * HTTPS Agent Configuration
 * This file creates a custom HTTPS agent that uses the provided certificates
 * for secure connections to localhost API.
 */

import { Agent } from 'https';
import fs from 'fs';
import path from 'path';

// Path to certificate files
const CERT_PATH = path.resolve(process.cwd(), 'cert/cert.pem');
const KEY_PATH = path.resolve(process.cwd(), 'cert/key.pem');

// Create a custom HTTPS agent with our certificates
let httpsAgent: Agent | null = null;

try {
  // Check if certificate files exist
  if (fs.existsSync(CERT_PATH) && fs.existsSync(KEY_PATH)) {
    const cert = fs.readFileSync(CERT_PATH);
    const key = fs.readFileSync(KEY_PATH);
    
    httpsAgent = new Agent({
      cert,
      key,
      rejectUnauthorized: false // Allow self-signed certificates
    });
    
    console.log('HTTPS Agent created with certificates');
  } else {
    console.warn('Certificate files not found. Using default HTTPS settings.');
    
    // Create agent that accepts self-signed certificates
    httpsAgent = new Agent({
      rejectUnauthorized: false
    });
  }
} catch (error) {
  console.error('Error creating HTTPS agent:', error);
  
  // Fallback to an agent that accepts self-signed certificates
  httpsAgent = new Agent({
    rejectUnauthorized: false
  });
}

export default httpsAgent;
