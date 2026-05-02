import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "../../contexts/AuthContext";

export default function Login({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [language, setLanguage] = useState("English");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = "Username is required.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await login(username.trim(), password);
      if (!result.success) {
        throw new Error(result.message);
      }
      navigation.replace("Main");
    } catch (error) {
      console.error("Login error:", error.message);
      Alert.alert("Login Failed", error.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      {/* Title */}
      <Text style={styles.title}>LOGIN</Text>

      {/* Logo */}
      <Image
        source={require("../../assets/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Username Input */}
      <View style={[styles.inputBox, errors.username && styles.inputBoxError]}>
        <Ionicons name="person-outline" size={20} color={errors.username ? "#E05050" : "#B8956A"} style={styles.icon} />
        <TextInput
          placeholder="Username or Email"
          placeholderTextColor="#B8956A"
          style={styles.input}
          value={username}
          onChangeText={(val) => {
            setUsername(val);
            if (errors.username) setErrors((e) => ({ ...e, username: null }));
          }}
          autoCapitalize="none"
          editable={!loading}
        />
        {errors.username && (
          <Ionicons name="alert-circle" size={18} color="#E05050" />
        )}
      </View>
      {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

      {/* Password Input */}
      <View style={[styles.inputBox, errors.password && styles.inputBoxError]}>
        <Ionicons name="lock-closed-outline" size={20} color={errors.password ? "#E05050" : "#B8956A"} style={styles.icon} />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#B8956A"
          secureTextEntry={!showPassword}
          style={styles.input}
          value={password}
          onChangeText={(val) => {
            setPassword(val);
            if (errors.password) setErrors((e) => ({ ...e, password: null }));
          }}
          editable={!loading}
        />
        <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={20}
            color="#B8956A"
          />
        </TouchableOpacity>
      </View>
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      {/* Language Selector */}
      <View style={styles.inputBox}>
        <Ionicons name="globe-outline" size={20} color="#B8956A" style={styles.icon} />
        <Text style={styles.languageLabel}>Language</Text>
        <Picker
          selectedValue={language}
          onValueChange={(val) => setLanguage(val)}
          style={styles.picker}
          dropdownIconColor="#B8956A"
        >
          <Picker.Item label="English" value="English" />
          <Picker.Item label="Filipino" value="Filipino" />
        </Picker>
      </View>

      {/* Forgot Password */}
      <TouchableOpacity
        onPress={() => navigation.navigate("ForgotPass")}
        style={styles.forgotContainer}
      >
        <Text style={styles.forgot}>
          Forgot Password? <Text style={styles.click}>Click here</Text>
        </Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity 
        style={styles.loginBtn} 
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.loginText}>LOGIN</Text>
        )}
      </TouchableOpacity>

    </View>
  );
}

// Keep your existing styles (they remain the same)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    paddingTop: 60,
  },

  title: {
    fontSize: 24,
    color: "#7A4A2E",
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 30,
  },

  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },

  inputBox: {
    width: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  inputBoxError: {
    borderColor: "#E05050",
    backgroundColor: "#FFF8F8",
  },

  icon: {
    marginRight: 12,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: "#333333",
  },

  errorText: {
    width: "85%",
    fontSize: 12,
    color: "#E05050",
    marginBottom: 8,
    marginLeft: 4,
  },

  languageLabel: {
    fontSize: 15,
    color: "#B8956A",
    flex: 1,
  },

  picker: {
    height: 40,
    width: 120,
    color: "#333333",
    marginRight: -10,
    borderColor: "transparent",
  },

  forgotContainer: {
    marginTop: 10,
    marginBottom: 15,
  },

  forgot: {
    fontSize: 13,
    color: "#8B7355",
  },

  click: {
    color: "#2f80ed",
    textDecorationLine: "underline",
  },

  loginBtn: {
    width: "70%",
    backgroundColor: "#D35400",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 15,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  loginText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 1,
  },
});