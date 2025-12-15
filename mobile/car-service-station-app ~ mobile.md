# Car Service Station - Mobile Application 📱

## 📖 Project Overview
This is the **Frontend Client** for the Car Service Station system, built with **React Native (Expo)**. It allows clients to find service stations, view dynamic pricing, book appointments, and chat with admins.

---

## ⚙️ Prerequisites
Before running this project, ensure you have:
1.  **Node.js**: Installed (v18+ recommended).
2.  **Expo Go**: Installed on your physical Android/iOS device (from Play Store / App Store).
    *   *Alternatively*: An Android Emulator or iOS Simulator set up on your PC.
3.  **Backend Server**: The `backend` project must be running on `http://localhost:5000`.

---

## 🚀 Installation

1.  **Navigate to the mobile directory**:
    ```bash
    cd mobile
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```
    *This installs all required packages including React Navigation, Axios, Expo modules, and Socket.IO client.*

---

## 🏃‍♂️ How to Run

### 1. Start the Development Server
```bash
npx expo start
```
*   Use `--clear` if you encounter caching issues: `npx expo start --clear`

### 2. Run on Your Device
*   **Physical Device**: Open the **Expo Go** app and scan the QR code displayed in the terminal.
    *   *Note*: Your phone and PC must be on the **same Wi-Fi network**.
*   **Android Emulator**: Press `a` in the terminal.
*   **iOS Simulator**: Press `i` in the terminal (macOS only).

---

## 🔌 Configuration

### API Connection (`src/services/api.js`)
The app needs to hit your backend. By default, it's configured for typical setups, but you might need to adjust the IP:

*   **Open** `src/services/api.js`.
*   **Update `BASE_URL`**:
    *   **Hardware Device**: Use your PC's local IP (e.g., `http://192.168.1.5:5000/api`).
    *   **Emulator**: Use `http://10.0.2.2:5000/api`.

---

## 📂 Project Structure

```
mobile/
├── assets/             # Images and fonts
├── src/
│   ├── components/     # Reusable UI elements (Buttons, Cards)
│   ├── context/        # Global State (AuthContext.js)
│   ├── screens/        # Main App Screens
│   │   ├── LoginScreen.js      # User Entry
│   │   ├── HomeScreen.js       # Station Selection
│   │   ├── ServicesScreen.js   # Service List & Pricing
│   │   ├── BookingScreen.js    # Booking Form
│   │   ├── ChatScreen.js       # Real-time Chat
│   │   └── MyBookingsScreen.js # History & Status
│   ├── services/       # API Integration (Axios)
│   └── navigation/     # (Implicit in App.js)
├── App.js              # Main Entry & Navigation Setup
└── app.json            # Expo Configuration
```

---

## ✨ Features & Usage Flow

1.  **Authentication**: Login or Register a new Client account.
2.  **Select Station**: Choose a Service Station from the Home list.
3.  **View Services**: Browse services offered by that station. Prices are specific to the station!
4.  **Book Appointment**:
    *   Select a Service.
    *   Pick a **Date and Time**.
    *   Enter Vehicle Details (Make, Model, License Plate).
    *   Confirm Booking.
5.  **Track Status**: Go to "My Bookings" tab to see if your booking is Pending, Confirmed, or Completed.
6.  **Chat**: Tap on any booking in "My Bookings" to open a **Real-time Chat** with the station admin.

---

## 🔧 Troubleshooting

*   **Error: "Network Error" / "Connection Refused"**
    *   Verify Backend is running (`npm run dev` in backend folder).
    *   Verify IP Address in `src/services/api.js`.
    *   Ensure PC Firewall allows connection on port 5000.

*   **Error: "Unable to resolve module..."**
    *   Run `npm install` again.
    *   Restart Metro with `npx expo start --clear`.

*   **Crash on Calendar/Date Picker**
    *   We use native datetime pickers. Ensure you have rebuilt the native app if using a development build, or simply restart Expo Go.
