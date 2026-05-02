import React, { useState } from "react";
import { 
  View, Text, TouchableOpacity, StyleSheet, 
  TextInput, Alert, ActivityIndicator 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { API_URL } from "../../config";

export default function ChangePassword({ navigation, route }) {
  // Get resetToken from navigation params (from ForgotPassword)
  const { resetToken, userId } = route.params || {};
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      // Make API call to update password
      const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
        resetToken,
        newPassword,
        confirmPassword
      });

      // Check if password was successfully updated
      if (response.status === 200 || response.data.success) {
        // Show success message
        Alert.alert(
          "Success!",
          "Your password has been reset successfully.",
          [
            {
              text: "Go to Login",
              onPress: () => {
                // Clear the entire navigation stack and navigate to Login.jsx
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }], // Make sure 'Login' matches your screen name exactly
                });
              }
            }
          ]
        );
      } else {
        throw new Error("Password reset failed");
      }
      
    } catch (error) {
      console.error("Password reset error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.error || error.response?.data?.message || "Failed to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#E45C2B" />
        </TouchableOpacity>
        <Text style={styles.title}>Create New Password</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.instruction}>
          Please enter your new password below.
        </Text>

        {/* New Password */}
        <View style={[styles.inputBox, errors.newPassword && styles.inputBoxError]}>
          <Ionicons name="lock-closed-outline" size={20} color="#B8956A" />
          <TextInput
            placeholder="New Password"
            placeholderTextColor="#B8956A"
            style={styles.input}
            secureTextEntry={!showNew}
            value={newPassword}
            onChangeText={(val) => {
              setNewPassword(val);
              if (errors.newPassword) setErrors({ ...errors, newPassword: null });
            }}
          />
          <TouchableOpacity onPress={() => setShowNew(!showNew)}>
            <Ionicons name={showNew ? "eye-off-outline" : "eye-outline"} size={20} color="#B8956A" />
          </TouchableOpacity>
        </View>
        {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}

        {/* Confirm Password */}
        <View style={[styles.inputBox, errors.confirmPassword && styles.inputBoxError]}>
          <Ionicons name="lock-closed-outline" size={20} color="#B8956A" />
          <TextInput
            placeholder="Confirm New Password"
            placeholderTextColor="#B8956A"
            style={styles.input}
            secureTextEntry={!showConfirm}
            value={confirmPassword}
            onChangeText={(val) => {
              setConfirmPassword(val);
              if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
            }}
          />
          <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
            <Ionicons name={showConfirm ? "eye-off-outline" : "eye-outline"} size={20} color="#B8956A" />
          </TouchableOpacity>
        </View>
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

        {/* Reset Button */}
        <TouchableOpacity style={styles.updateBtn} onPress={handleResetPassword} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.updateText}>Reset Password</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EFEFEF",
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#7A4A2E",
    marginLeft: 12,
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  instruction: {
    fontSize: 14,
    color: "#8B7355",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 20,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  inputBoxError: {
    borderColor: "#E05050",
    backgroundColor: "#FFF8F8",
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    marginLeft: 10,
  },
  errorText: {
    color: "#E05050",
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 12,
  },
  updateBtn: {
    backgroundColor: "#D35400",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
  },
  updateText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
});