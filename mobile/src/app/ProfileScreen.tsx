import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';

export const ProfileScreen = ({ navigation }: any) => {
  const openWebProfile = () => {
    const ports = ['3000', '3001', '3002'];
    const baseUrl = `http://localhost`;
    
    Linking.openURL(`${baseUrl}:${ports[0]}/profile`).catch(() => {
      Linking.openURL(`${baseUrl}:${ports[1]}/profile`).catch(() => {
        Linking.openURL(`${baseUrl}:${ports[2]}/profile`).catch(() => {
          console.warn('Could not open web profile');
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
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.userName}>User</Text>
          <Text style={styles.userEmail}>user@example.com</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Account Settings</Text>
          <Text style={styles.sectionDescription}>
            Manage your account preferences, security settings, and personal information.
          </Text>
        </View>

        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]}
            onPress={openWebProfile}
          >
            <Text style={styles.primaryButtonText}>Open Full Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('Messages')}
          >
            <Text style={styles.secondaryButtonText}>View Messages</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.infoTitle}>📊 Your Stats</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>42</Text>
              <Text style={styles.statLabel}>Conversations</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>15</Text>
              <Text style={styles.statLabel}>AI Agents</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>7</Text>
              <Text style={styles.statLabel}>Projects</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.infoTitle}>🔧 Quick Actions</Text>
          <TouchableOpacity style={[styles.button, styles.actionButton]}>
            <Text style={styles.actionButtonText}>⚙️ Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.actionButton]}>
            <Text style={styles.actionButtonText}>🔔 Notifications</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.actionButton]}>
            <Text style={styles.actionButtonText}>🔒 Privacy</Text>
          </TouchableOpacity>
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
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
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
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 8,
  },
  actionButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
});
