import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, ScrollView, Platform, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import api from '../services/api';

const BookingScreen = ({ route, navigation }) => {
  const { service, stationId } = route.params || {};

  // Default to tomorrow at 10:00 AM to ensure valid operating hours
  const getTomorrowTenAM = () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(10, 0, 0, 0);
      return d;
  };

  const [date, setDate] = useState(getTomorrowTenAM());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [vehicleDetails, setVehicleDetails] = useState({ make: '', model: '', year: '', licensePlate: '' });
  const [instructions, setInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      // Preserve current time, update date
      const newDate = new Date(selectedDate);
      newDate.setHours(date.getHours(), date.getMinutes());
      setDate(newDate);
    }
  };

  const onTimeChange = (event, selectedDate) => {
    setShowTimePicker(false);
    if (event.type === 'set' && selectedDate) {
      // Preserve current date, update time
      const newDate = new Date(date);
      newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
      setDate(newDate);
    }
  };

  const handleBooking = async () => {
    if (!vehicleDetails.make || !vehicleDetails.model || !vehicleDetails.licensePlate) {
        Alert.alert('Missing Info', 'Please fill in vehicle details.');
        return;
    }

    setSubmitting(true);
    try {
        const payload = {
            serviceId: service.service.id,
            stationId: stationId,
            scheduledDate: date.toISOString(),
            vehicleDetails: vehicleDetails,
            specialInstructions: instructions
        };

        const response = await api.post('/bookings', payload);
        
        if (response.data.success) {
            Alert.alert(
                'Success', 
                'Booking created successfully!',
                [{ text: 'OK', onPress: () => navigation.navigate('MyBookingsTab') }] 
            );
        }
    } catch (error) {
        Alert.alert('Error', error.response?.data?.message || 'Booking failed');
    } finally {
        setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.summaryCard}>
          <Text style={styles.serviceName}>{service?.service?.name}</Text>
          <Text style={styles.price}>Total Price: ${service?.price}</Text>
      </View>

      <Text style={styles.sectionTitle}>Select Date & Time</Text>
      
      <View style={styles.dateTimeRow}>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.halfButton}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.dateText}>{moment(date).format('MMM Do YYYY')}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.halfButton}>
            <Text style={styles.label}>Time</Text>
            <Text style={styles.dateText}>{moment(date).format('h:mm A')}</Text>
        </TouchableOpacity>
      </View>
      
      {showDatePicker && (
        <DateTimePicker
          testID="datePicker"
          value={date}
          mode="date" 
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          testID="timePicker"
          value={date}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={onTimeChange}
        />
      )}

      <Text style={styles.sectionTitle}>Vehicle Details</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Make (e.g. Toyota)" 
        value={vehicleDetails.make}
        onChangeText={(t) => setVehicleDetails({...vehicleDetails, make: t})}
      />
      <TextInput 
        style={styles.input} 
        placeholder="Model (e.g. Camry)"
        value={vehicleDetails.model}
        onChangeText={(t) => setVehicleDetails({...vehicleDetails, model: t})}
      />
      <TextInput 
        style={styles.input} 
        placeholder="Year"
        keyboardType="numeric"
        value={vehicleDetails.year}
        onChangeText={(t) => setVehicleDetails({...vehicleDetails, year: t})}
      />
      <TextInput 
        style={styles.input} 
        placeholder="License Plate"
        value={vehicleDetails.licensePlate}
        onChangeText={(t) => setVehicleDetails({...vehicleDetails, licensePlate: t})}
      />

      <Text style={styles.sectionTitle}>Special Instructions (Optional)</Text>
      <TextInput 
        style={[styles.input, styles.textArea]} 
        placeholder="Any specific issues?"
        multiline
        numberOfLines={3}
        value={instructions}
        onChangeText={setInstructions}
      />

      <Button 
        title={submitting ? "Confirming..." : "Confirm Booking"} 
        onPress={handleBooking} 
        disabled={submitting} 
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flexGrow: 1
  },
  summaryCard: {
      backgroundColor: '#EFF6FF', // Blue 50
      padding: 20,
      borderRadius: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: '#DBEAFE', // Blue 100
  },
  serviceName: {
      fontSize: 20,
      fontWeight: '800',
      color: '#1E40AF', // Blue 800
      marginBottom: 8
  },
  price: {
      fontSize: 24,
      color: '#059669', // Emerald 600
      fontWeight: '800'
  },
  sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: '#374151',
      marginBottom: 16,
      marginTop: 8
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  halfButton: {
    width: '48%',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4
  },
  dateText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1F2937'
  },
  input: {
      borderWidth: 1,
      borderColor: '#D1D5DB',
      padding: 16,
      marginBottom: 16,
      borderRadius: 12,
      backgroundColor: '#FFF',
      fontSize: 16,
      color: '#1F2937'
  },
  textArea: {
      height: 100,
      textAlignVertical: 'top'
  },
  // Button styling handled by native Button component mostly, 
  // but if we wrapped it we'd use styles here.
});

export default BookingScreen;
