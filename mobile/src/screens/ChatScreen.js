import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// IMPORTANT: Match this with backend port
// For Emulator: 10.0.2.2:5000
// For Physical: YOUR_IP:5000
const SOCKET_URL = 'http://192.168.1.51:5000'; // Hardcoded for your physical device setup

const ChatScreen = ({ route }) => {
  const { bookingId } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const socket = useRef(null);

  useEffect(() => {
    // 1. Fetch existing messages
    fetchMessages();

    // 2. Connect Socket
    socket.current = io(SOCKET_URL);
    
    // 3. Join Room
    socket.current.emit('join-booking-room', bookingId);
    console.log(`Joined room: booking-${bookingId}`);

    // 4. Listen for messages
    socket.current.on('receive-message', (message) => {
        setMessages(prev => [...prev, message]);
    });

    return () => {
        socket.current.disconnect();
    };
  }, []);

  const fetchMessages = async () => {
      try {
          const response = await api.get(`/chat/${bookingId}`); // Backend needs this route
          // Note: If backend doesn't have this specific route, we might need to rely on live chat or add it.
          // Assuming the message model exists, we should have a route.
          // If not, we start empty.
          if(response.data.success) {
               setMessages(response.data.data);
          }
      } catch (err) {
          console.log('Error fetching chat history', err);
      }
  };

  const sendMessage = () => {
      if (!newMessage.trim()) return;

      const messageData = {
          bookingId,
          userId: user.id,
          message: newMessage,
          senderName: user.firstName, // Optional for UI
          timestamp: new Date().toISOString()
      };

      // Emit to socket
      socket.current.emit('send-message', messageData);

      // Optimistically add to UI
      setMessages(prev => [...prev, messageData]);
      setNewMessage('');
      
      // Persist to backend (Optional if socket handles it, but usually API does it too)
      // api.post('/chat', messageData);
  };

  const renderItem = ({ item }) => {
      const isMe = item.userId === user.id;
      return (
          <View style={[styles.bubbleContainer, isMe ? styles.rightContainer : styles.leftContainer]}>
              <View style={[styles.bubble, isMe ? styles.rightBubble : styles.leftBubble]}>
                  <Text style={[styles.messageText, isMe ? styles.rightText : styles.leftText]}>
                      {item.message}
                  </Text>
                  <Text style={styles.timeText}>
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
              </View>
          </View>
      );
  };

  return (
    <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
    >
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
      
      <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
      padding: 15,
      paddingBottom: 20
  },
  bubbleContainer: {
      marginBottom: 10,
      flexDirection: 'row',
      width: '100%'
  },
  rightContainer: {
      justifyContent: 'flex-end'
  },
  leftContainer: {
      justifyContent: 'flex-start'
  },
  bubble: {
      maxWidth: '80%',
      padding: 10,
      borderRadius: 15,
  },
  rightBubble: {
      backgroundColor: '#007AFF',
      borderBottomRightRadius: 2
  },
  leftBubble: {
      backgroundColor: '#E5E5EA',
      borderBottomLeftRadius: 2
  },
  messageText: {
      fontSize: 16
  },
  rightText: {
      color: '#fff'
  },
  leftText: {
      color: '#000'
  },
  timeText: {
      fontSize: 10,
      marginTop: 5,
      color: 'rgba(0,0,0,0.5)',
      alignSelf: 'flex-end'
  },
  inputContainer: {
      flexDirection: 'row',
      padding: 10,
      borderTopWidth: 1,
      borderTopColor: '#eee',
      backgroundColor: '#fff'
  },
  input: {
      flex: 1,
      backgroundColor: '#f0f0f0',
      borderRadius: 20,
      paddingHorizontal: 15,
      paddingVertical: 10,
      marginRight: 10
  },
  sendButton: {
      backgroundColor: '#007AFF',
      borderRadius: 20,
      justifyContent: 'center',
      paddingHorizontal: 20
  },
  sendText: {
      color: '#fff',
      fontWeight: 'bold'
  }
});

export default ChatScreen;
