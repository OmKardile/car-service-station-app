import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { StatusBar } from 'expo-status-bar';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import ServicesScreen from './src/screens/ServicesScreen';
import StationsScreen from './src/screens/StationsScreen'; // Legacy, but kept
import BookingScreen from './src/screens/BookingScreen';
import MyBookingsScreen from './src/screens/MyBookingsScreen';
import ChatScreen from './src/screens/ChatScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- Tab Navigator ---
const MainTabs = () => {
    return (
        <Tab.Navigator screenOptions={{ headerShown: false }}>
            <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Home' }} />
            <Tab.Screen name="MyBookingsTab" component={MyBookingsStack} options={{ title: 'My Bookings' }} />
            <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
        </Tab.Navigator>
    );
};

// --- Stack Navigators for Tabs ---
const HomeStack = () => {
    return (
        <Stack.Navigator>
             <Stack.Screen name="StationList" component={HomeScreen} options={{ title: 'Car Service Stations' }} />
             <Stack.Screen name="Services" component={ServicesScreen} options={{ title: 'Services' }} />
             <Stack.Screen name="Booking" component={BookingScreen} options={{ title: 'Book Service' }} />
        </Stack.Navigator>
    );
};

const MyBookingsStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="MyBookingsList" component={MyBookingsScreen} options={{ title: 'My Bookings' }} />
            <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat with Station' }} />
        </Stack.Navigator>
    );
};

// --- Root Navigator ---
const AppNavigator = () => {
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: true, title: 'Create Account' }} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </AuthProvider>
    </NavigationContainer>
  );
}
