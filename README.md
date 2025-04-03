# Test Scenario Management System

A responsive GUI for managing test scenarios with secure API integration.

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Place your SSL certificates in the `cert` directory:
   - `cert.pem` - SSL certificate
   - `key.pem` - SSL private key

4. Start the development server:
   ```
   npm run dev
   ```

## Certificate Configuration

The application is configured to use SSL certificates for secure communication with the API. 
To enable this feature:

1. Create a `cert` directory in the project root if it doesn't exist
2. Place your certificate files in this directory:
   - `cert.pem` - The SSL certificate
   - `key.pem` - The SSL private key

If the certificate files are not found, the application will fall back to accepting self-signed certificates,
but you may still encounter browser security warnings.

## API Integration

The application connects to an API at `https://localhost:8000`. If you encounter connection issues:

1. Try accessing the API directly at https://localhost:8000/docs in your browser
2. Accept any certificate warnings that appear
3. Return to the application and try submitting again

## Features

- Agent configuration with model selection
- Step-by-step test scenario creation
- Drag-and-drop step reordering
- Local storage for saving and loading configurations
- API payload preview
- Secure HTTPS communication
- Accessibility features including high contrast mode

## Development

This project uses:
- React with TypeScript
- Tailwind CSS for styling
- react-hook-form for form management
- zod for validation
- react-beautiful-dnd for drag-and-drop functionality
