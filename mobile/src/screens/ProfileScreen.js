import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  
  // In a real app, we would fetch fresh profile data here. 
  // For now, we use the user context.

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.firstName?.[0]}{user?.lastName?.[0]}</Text>
        </View>
        <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.role}>Role: {user?.role}</Text>
      </View>

      <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Info</Text>
          <View style={styles.infoRow}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{user?.phone || 'Not set'}</Text>
          </View>
      </View>

      <View style={styles.actions}>
          <Button title="Logout" onPress={logout} color="red" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#007AFF',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 15
  },
  avatarText: {
      color: '#fff',
      fontSize: 30,
      fontWeight: 'bold'
  },
  name: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 5
  },
  email: {
      color: '#666',
      fontSize: 16,
      marginBottom: 5
  },
  role: {
      color: '#999',
      fontSize: 14,
      textTransform: 'uppercase'
  },
  section: {
      backgroundColor: '#fff',
      marginTop: 20,
      padding: 20
  },
  sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 15,
      color: '#333'
  },
  infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10
  },
  label: {
      color: '#666'
  },
  value: {
      fontWeight: '500'
  },
  actions: {
      marginTop: 30,
      paddingHorizontal: 20
  }
});

export default ProfileScreen;
