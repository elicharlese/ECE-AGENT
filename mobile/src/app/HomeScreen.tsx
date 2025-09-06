import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { NativeThemeToggle } from '../components/NativeThemeToggle'
import { InteractiveChatPreview } from '../components/InteractiveChatPreview'

export const HomeScreen = ({ navigation }: any) => {
  const openWebHome = () => {
    const ports = ['3000', '3001', '3002'];
    const baseUrl = `http://localhost`;
    
    Linking.openURL(`${baseUrl}:${ports[0]}/`).catch(() => {
      Linking.openURL(`${baseUrl}:${ports[1]}/`).catch(() => {
        Linking.openURL(`${baseUrl}:${ports[2]}/`).catch(() => {
          console.warn('Could not open web home');
        });
      });
    });
  };

  const openDocs = () => {
    const ports = ['3000', '3001', '3002'];
    const baseUrl = `http://localhost`;
    Linking.openURL(`${baseUrl}:${ports[0]}/design-system`).catch(() => {
      Linking.openURL(`${baseUrl}:${ports[1]}/design-system`).catch(() => {
        Linking.openURL(`${baseUrl}:${ports[2]}/design-system`).catch(() => {
          console.warn('Could not open documentation');
        });
      });
    });
  };

  return (
    <View style={styles.container}>
      <NativeThemeToggle />
      <ScrollView style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome to ECE Agent</Text>
          <Text style={styles.welcomeSubtitle}>
            Your AI-powered assistant ecosystem
          </Text>
        </View>

        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.card, styles.primaryCard]}
            onPress={() => navigation.navigate('Messages')}
          >
            <Text style={styles.cardEmoji}>💬</Text>
            <Text style={styles.cardTitle}>Messages</Text>
            <Text style={styles.cardDescription}>
              Chat with AI agents and start conversations
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.card, styles.secondaryCard]}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.cardEmoji}>👤</Text>
            <Text style={styles.cardTitle}>Profile</Text>
            <Text style={styles.cardDescription}>
              Manage your account and preferences
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.card, styles.secondaryCard]}
            onPress={openWebHome}
          >
            <Text style={styles.cardEmoji}>🌐</Text>
            <Text style={styles.cardTitle}>Web Dashboard</Text>
            <Text style={styles.cardDescription}>
              Access full web experience
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.card, styles.secondaryCard]}
            onPress={openDocs}
          >
            <Text style={styles.cardEmoji}>📚</Text>
            <Text style={styles.cardTitle}>View Documentation</Text>
            <Text style={styles.cardDescription}>
              Design system and component docs
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚀 Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction}>
              <Text style={styles.quickActionEmoji}>🤖</Text>
              <Text style={styles.quickActionText}>New Agent</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <Text style={styles.quickActionEmoji}>📁</Text>
              <Text style={styles.quickActionText}>Projects</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <Text style={styles.quickActionEmoji}>⚙️</Text>
              <Text style={styles.quickActionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.infoTitle}>📱 Mobile Features</Text>
          <Text style={styles.infoText}>
            • Native mobile experience{'\n'}
            • Seamless web integration{'\n'}
            • Cross-platform compatibility{'\n'}
            • Offline capabilities
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💬 Chat Preview</Text>
          <InteractiveChatPreview />
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
  content: {
    flex: 1,
    padding: 16,
  },
  welcomeSection: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryCard: {
    backgroundColor: '#007AFF',
  },
  secondaryCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardEmoji: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickAction: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  quickActionEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
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
