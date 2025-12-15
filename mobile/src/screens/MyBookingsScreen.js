import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import api from '../services/api';
import moment from 'moment';

const MyBookingsScreen = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      if (response.data.success) {
        setBookings(response.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
      setRefreshing(true);
      fetchBookings();
  };

  const getStatusColor = (status) => {
      switch(status) {
          case 'pending': return '#f1c40f';
          case 'confirmed': return '#3498db';
          case 'in_progress': return '#e67e22';
          case 'completed': return '#2ecc71';
          case 'cancelled': return '#e74c3c';
          default: return '#95a5a6';
      }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('Chat', { bookingId: item.id })}
    >
      <View style={styles.headerRow}>
          <Text style={styles.serviceName}>{item.service?.name || 'Unknown Service'}</Text>
          <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.badgeText}>{item.status}</Text>
          </View>
      </View>
      
      <Text style={styles.stationName}>@ {item.station?.name}</Text>
      
      <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>Scheduled:</Text>
          <Text style={styles.dateValue}>{moment(item.scheduledDate).format('MMM D, YYYY h:mm A')}</Text>
      </View>

      <Text style={styles.price}>Total: ${item.totalPrice}</Text>
      
      <View style={styles.footer}>
          <Text style={styles.chatHint}>Tap to Chat with Admin →</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator size="large" style={styles.center} />;
  }

  return (
    <View style={styles.container}>
        <FlatList
            data={bookings}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
                <View style={styles.center}>
                    <Text style={styles.emptyText}>No bookings found.</Text>
                </View>
            }
        />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderLeftWidth: 6,
    borderLeftColor: '#4F46E5' // Default, overridden inline
  },
  headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8
  },
  serviceName: {
      fontSize: 18,
      fontWeight: '700',
      color: '#111827',
      flex: 1
  },
  badge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      overflow: 'hidden'
  },
  badgeText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.5
  },
  stationName: {
      color: '#6B7280',
      marginBottom: 12,
      fontSize: 14,
      fontWeight: '500'
  },
  dateRow: {
      flexDirection: 'row',
      marginBottom: 4
  },
  dateLabel: {
      color: '#9CA3AF',
      marginRight: 6,
      fontSize: 13
  },
  dateValue: {
      fontWeight: '600',
      color: '#374151',
      fontSize: 13
  },
  price: {
      fontSize: 18,
      fontWeight: '800',
      color: '#1F2937',
      marginTop: 12
  },
  footer: {
      marginTop: 16,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: '#F3F4F6',
      alignItems: 'flex-end'
  },
  chatHint: {
      color: '#4F46E5',
      fontSize: 14,
      fontWeight: '600'
  },
  emptyText: {
      color: '#9CA3AF',
      fontSize: 16,
      textAlign: 'center'
  }
});

export default MyBookingsScreen;
