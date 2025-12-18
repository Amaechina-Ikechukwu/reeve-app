import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useToast } from '@/contexts/ToastContext';
import { auth } from '@/firebase';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';
import { Button } from './button';
import { IconSymbol } from './icon-symbol';
import { ThemedTextInput } from './text-input';

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
}

export function LoginModal({ visible, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleLogin = async () => {
    if (!email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        showToast('Please verify your email first', 'info');
        onClose();
        router.push('/auth/verify-email');
        return;
      }
      
      showToast('Login successful!', 'success');
      onClose();
      // UserStatusChecker will handle further redirects
    } catch (error: any) {
      const errorMessage = error.code === 'auth/invalid-credential' 
        ? 'Invalid email or password' 
        : error.message;
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    onClose();
    router.push('/auth/signin');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <ThemedView style={[
          styles.modal,
          {
            backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          }
        ]}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <ThemedText type="title" style={styles.title}>
                Welcome Back
              </ThemedText>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <IconSymbol
                  size={24}
                  name="xmark"
                  color={Colors[colorScheme ?? 'light'].text}
                />
              </TouchableOpacity>
            </View>

            <ThemedText style={[styles.subtitle, { opacity: 0.7 }]}>
              Sign in to access your account
            </ThemedText>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Email</ThemedText>
                <ThemedTextInput
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Password</ThemedText>
                <ThemedTextInput
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="password"
                  editable={!loading}
                />
              </View>

              <Button
                title="Login"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                size="large"
              />

              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />
                <ThemedText style={[styles.dividerText, { opacity: 0.5 }]}>or</ThemedText>
                <View style={[styles.dividerLine, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />
              </View>

              <TouchableOpacity 
                onPress={handleSignUp}
                style={[styles.signUpButton, { 
                  borderColor: Colors[colorScheme ?? 'light'].tint,
                  backgroundColor: isDark ? 'rgba(255,7,7,0.1)' : 'rgba(255,7,7,0.05)'
                }]}
                disabled={loading}
              >
                <ThemedText style={[styles.signUpText, { color: Colors[colorScheme ?? 'light'].tint }]}>
                  Don't have an account? Sign Up
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </ThemedView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  modal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 32,
    maxHeight: '85%',
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 28,
  },
  form: {
    gap: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
  },
  signUpButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
