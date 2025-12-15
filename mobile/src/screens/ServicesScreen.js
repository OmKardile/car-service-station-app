import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import api from '../services/api';

const ServicesScreen = ({ route, navigation }) => {
  const { stationId, stationName } = route.params || {};
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (stationId) {
        fetchServices();
    }
  }, [stationId]);

  const fetchServices = async () => {
    try {
      const response = await api.get(`/services/station/${stationId}`);
      if (response.data.success) {
        setServices(response.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('Booking', { service: item, stationId })}
    >
      <View style={styles.headerRow}>
          <Text style={styles.name}>{item.service.name}</Text>
          <Text style={styles.price}>${item.price}</Text>
      </View>
      <Text style={styles.description} numberOfLines={2}>{item.service.description}</Text>
      <Text style={styles.duration}>Est. {item.service.estimatedDuration} mins</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator size="large" style={styles.center} />;
  }

  return (
    <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.title}>Services at {stationName}</Text>
        </View>
        <FlatList
        data={services}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No services found for this station.</Text>}
        />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#F3F4F6'
  },
  header: {
      padding: 24,
      backgroundColor: '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
  },
  title: {
      fontSize: 22,
      fontWeight: '800',
      color: '#111827',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    marginRight: 8
  },
  description: {
    color: '#6B7280',
    marginBottom: 12,
    fontSize: 14,
    lineHeight: 20
  },
  price: {
    fontWeight: '800',
    color: '#059669', // Emerald 600
    fontSize: 20,
    backgroundColor: '#ECFDF5', // Emerald 50
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden'
  },
  duration: {
      fontSize: 13,
      color: '#9CA3AF',
      fontWeight: '500',
      marginTop: 4
  },
  empty: {
      textAlign: 'center',
      marginTop: 40,
      color: '#9CA3AF',
      fontSize: 16
  }
});

export default ServicesScreen;
