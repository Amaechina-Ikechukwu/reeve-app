import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { ThemedTextInput } from '@/components/ui/text-input';
import { useToast } from '@/contexts/ToastContext';
import { auth } from '@/firebase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

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
        router.replace('/auth/verify-email');
        return;
      }
      
      // On success, navigate to main app (UserStatusChecker will handle BVN check)
      router.replace('/(tabs)');
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      showToast('Please enter your email address', 'error');
      return;
    }

    Alert.alert(
      'Reset Password',
      `Send password reset email to ${email}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Send',
          onPress: async () => {
            setLoading(true);
            try {
              await sendPasswordResetEmail(auth, email);
              showToast('Password reset email sent! Check your inbox.', 'success');
            } catch (error: any) {
              if (error.code === 'auth/user-not-found') {
                showToast('No account found with this email', 'error');
              } else if (error.code === 'auth/invalid-email') {
                showToast('Invalid email address', 'error');
              } else {
                showToast('Failed to send reset email. Please try again.', 'error');
              }
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ThemedView style={styles.inner}>
        <ThemedText type="title" style={styles.title}>
          Welcome Back
        </ThemedText>

        <View style={styles.form}>
          <ThemedTextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            // style={styles.input}
          />

          <ThemedTextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            // style={styles.input}
          />

          <Button
            title="Login"
            onPress={handleLogin}
            loading={loading}
            style={styles.button}
          />

          <ThemedText
            type="link"
            onPress={handleForgotPassword}
            style={styles.forgotText}
          >
            Forgot Password?
          </ThemedText>

          <ThemedText
            type="link"
            onPress={() => router.push('/auth/signin')}
            style={styles.linkText}
          >
            Don't have an account? Sign Up
          </ThemedText>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    width: '100%',
    gap:20
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 20,
  },
  linkButton: {
    marginTop: 16,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF0707',
  },
  forgotText: {
    marginTop: 12,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  linkText: {
    marginTop: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});