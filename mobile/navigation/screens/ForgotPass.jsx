import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL } from '../../config';

export default function ForgotPass({ navigation }) {
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [userId, setUserId] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateEmail = () => {
    if (!email.trim()) {
      setErrors({ email: 'Email is required' });
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSendCode = async () => {
    if (!validateEmail()) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      setUserId(response.data.userId);
      Alert.alert('Code Sent', 'A verification code has been sent to your email.');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!otpCode || otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-reset-otp`, {
        userId,
        otpCode
      });
      
      // Navigate to ChangePassword with the reset token
      navigation.navigate('ChangePassword', { 
        resetToken: response.data.resetToken,
        userId: response.data.userId
      });
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#7A4A2E" />
        </TouchableOpacity>

        <Text style={styles.title}>Reset Password</Text>

        {/* Email Input Section */}
        {!userId ? (
          <>
            <Text style={styles.instruction}>
              Enter your email address and we'll send you a verification code.
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#B8956A" />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#B8956A"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <TouchableOpacity
              style={styles.button}
              onPress={handleSendCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Send Verification Code</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.instruction}>
              We've sent a 6-digit verification code to {email}
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons name="key-outline" size={20} color="#B8956A" />
              <TextInput
                style={[styles.input, styles.otpInput]}
                placeholder="000000"
                placeholderTextColor="#B8956A"
                value={otpCode}
                onChangeText={setOtpCode}
                keyboardType="number-pad"
                maxLength={6}
                textAlign="center"
              />
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleVerifyCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Verify Code</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={resendCode}
              disabled={loading}
            >
              <Text style={styles.linkText}>Resend Code</Text>
            </TouchableOpacity>
          </>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 20,
    width: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#7A4A2E",
    marginBottom: 20,
    textAlign: "center",
  },
  instruction: {
    fontSize: 14,
    color: "#8B7355",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: "#333",
    marginLeft: 10,
  },
  otpInput: {
    fontSize: 20,
    letterSpacing: 4,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#D35400",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  linkButton: {
    alignItems: "center",
    paddingVertical: 10,
  },
  linkText: {
    color: "#D35400",
    fontSize: 14,
    fontWeight: "600",
  },
  errorText: {
    color: "#E05050",
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 12,
  },
});