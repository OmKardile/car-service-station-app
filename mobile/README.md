# Car Service Station - Mobile App

This is the React Native mobile client for the Car Service Station application. It is built using **Expo**.

## 🚀 Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Start the App**:
    ```bash
    npx expo start
    ```
    - Scan the QR code with the **Expo Go** app on your phone.
    - Press `a` to run on Android Emulator.
    - Press `i` to run on iOS Simulator.

## 📁 Project Structure

- **`src/`**: Main source code directory.
  - **`context/`**: State management (Authentication, etc.).
  - **`screens/`**: UI Screens (Login, Home, Services, etc.).
  - **`services/`**: API integration (Axios setup).
  - **`components/`**: Reusable UI components.

## 🔌 API Configuration

The API URL is configured in `src/services/api.js`.
- **Physical Device**: Update `BASE_URL` to your computer's local IP (e.g., `http://192.168.1.x:5000/api`).
- **Emulator**: Use `http://10.0.2.2:5000/api`.
