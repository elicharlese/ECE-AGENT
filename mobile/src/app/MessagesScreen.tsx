import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';

export const MessagesScreen = ({ navigation }: any) => {
  const openWebMessages = () => {
    const ports = ['3000', '3001', '3002'];
    const baseUrl = `http://localhost`;
    
    Linking.openURL(`${baseUrl}:${ports[0]}/messages`).catch(() => {
      Linking.openURL(`${baseUrl}:${ports[1]}/messages`).catch(() => {
        Linking.openURL(`${baseUrl}:${ports[2]}/messages`).catch(() => {
          console.warn('Could not open web messages');
        });
      });
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💬 Chat with AI Agents</Text>
          <Text style={styles.sectionDescription}>
            Connect with intelligent AI assistants for conversations, problem-solving, and creative collaboration.
          </Text>
        </View>

        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]}
            onPress={openWebMessages}
          >
            <Text style={styles.primaryButtonText}>Open Full Web Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.secondaryButtonText}>View Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.infoTitle}>📱 Mobile Features</Text>
          <Text style={styles.infoText}>
            • Quick access to AI conversations{'\n'}
            • Seamless web integration{'\n'}
            • Cross-platform messaging{'\n'}
            • Real-time responses
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  backButton: {
    marginRight: 16,
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
