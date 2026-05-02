import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from "react-native";
import React, { useState } from 'react'
import { Ionicons } from "@expo/vector-icons";

export default function AccountSettings({navigation}) {
  const [biometricLogin, setBiometricLogin] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [currentDevice, setCurrentDevice] = useState(true);
  const [currentStation, setCurrentStation] = useState(false);
  const [sharedWorkstation, setSharedWorkstation] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Main", { screen: "Profile" })}>
          <Ionicons name="arrow-back" size={26} color="#E45C2B" />
        </TouchableOpacity>
        
        <Text style={styles.title}>Account Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              {/* Placeholder for profile image */}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Anna Santos, RN</Text>
              <Text style={styles.profileRole}>Senior Nursing Staff</Text>
              <Text style={styles.profileLicense}>PRC License No.</Text>
            </View>
          </View>
        </View>

        {/* Professional Identity Section */}
        <Text style={styles.sectionTitle}>Professional Identity</Text>
        
        <TouchableOpacity style={styles.buttonOrange}>
          <Text style={styles.buttonOrangeText}>Digital Signature</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonWhite}>
          <Ionicons name="lock-closed-outline" size={20} color="#7A4A2E" style={styles.buttonIcon} />
          <Text style={styles.buttonWhiteText}>Change PIN/Password</Text>
        </TouchableOpacity>

        {/* Security & Access Section */}
        <Text style={styles.sectionTitle}>Security & Access</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Biometric Login</Text>
          <Switch
            value={biometricLogin}
            onValueChange={setBiometricLogin}
            trackColor={{ false: "#D1D1D1", true: "#90EE90" }}
            thumbColor={biometricLogin ? "#4CAF50" : "#f4f3f4"}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Two-Factor Authenticator</Text>
          <Switch
            value={twoFactorAuth}
            onValueChange={setTwoFactorAuth}
            trackColor={{ false: "#D1D1D1", true: "#90EE90" }}
            thumbColor={twoFactorAuth ? "#4CAF50" : "#f4f3f4"}
          />
        </View>

        {/* Device Management Section */}
        <Text style={styles.sectionTitle}>Device Management</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Tablet 1 Current Device</Text>
          <Switch
            value={currentDevice}
            onValueChange={setCurrentDevice}
            trackColor={{ false: "#D1D1D1", true: "#90EE90" }}
            thumbColor={currentDevice ? "#4CAF50" : "#f4f3f4"}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Tablet 1 Current Station 3</Text>
          <Switch
            value={currentStation}
            onValueChange={setCurrentStation}
            trackColor={{ false: "#D1D1D1", true: "#FFD700" }}
            thumbColor={currentStation ? "#FFA500" : "#f4f3f4"}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Shared Workstation 3</Text>
          <Switch
            value={sharedWorkstation}
            onValueChange={setSharedWorkstation}
            trackColor={{ false: "#D1D1D1", true: "#90EE90" }}
            thumbColor={sharedWorkstation ? "#4CAF50" : "#f4f3f4"}
          />
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EFEFEF",
    paddingTop: 30,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#7A4A2E",
    marginLeft: 12,
  },

  content: {
    flex: 1,
    paddingHorizontal: 16,
  },

  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#D1D1D1",
    marginRight: 16,
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#7A4A2E",
    marginBottom: 4,
  },

  profileRole: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 2,
  },

  profileLicense: {
    fontSize: 13,
    color: "#888888",
  },

  sectionTitle: {
    fontSize: 15,
    color: "#333333",
    marginBottom: 12,
    marginTop: 8,
  },

  buttonOrange: {
    backgroundColor: "#E67E50",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  buttonOrangeText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },

  buttonWhite: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  buttonIcon: {
    marginRight: 12,
  },

  buttonWhiteText: {
    fontSize: 15,
    color: "#333333",
  },

  settingRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  settingText: {
    fontSize: 15,
    color: "#333333",
    flex: 1,
  },
});