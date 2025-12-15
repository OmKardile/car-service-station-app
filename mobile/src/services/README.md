# Services

This directory handles network requests and API integration.

## Files
- **`api.js`**: Configures the Axios instance with the backend base URL.
  - Handles **Request Interceptors** for debugging.
  - Handles **Response Interceptors** for global error logging.
  - **Important**: Change `BASE_URL` here when switching between Emulator (`10.0.2.2`) and Physical Device (Local IP).
