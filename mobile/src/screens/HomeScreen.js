import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const response = await api.get('/stations');
      if (response.data.success) {
        setStations(response.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderStation = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('Services', { stationId: item.id, stationName: item.name })}
    >
      <Text style={styles.stationName}>{item.name}</Text>
      <Text style={styles.stationDetails}>{item.address}</Text>
      <Text style={styles.actionText}>Select Station →</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome, {user?.firstName}!</Text>
        <Text style={styles.subtitle}>Select a Service Station</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={stations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderStation}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No stations available.</Text>}
        />
      )}
      
      <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#F9FAFB',
  },
  stationName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  stationDetails: {
    color: '#6B7280',
    marginBottom: 16,
    fontSize: 14,
    lineHeight: 20,
  },
  actionText: {
    color: '#4F46E5',
    fontWeight: '700',
    fontSize: 15,
    alignSelf: 'flex-start',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#9CA3AF',
    fontSize: 16,
  },
  logoutButton: {
    padding: 20,
    backgroundColor: '#FFE4E6', // Soft red bg
    alignItems: 'center',
    margin: 16,
    borderRadius: 12,
  },
  logoutText: {
    color: '#E11D48', // Strong red text
    fontWeight: '700',
    fontSize: 16,
  }
});

export default HomeScreen;
