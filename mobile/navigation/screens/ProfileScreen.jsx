import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen({ navigation }) {
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleLogout = () => {
    setLogoutModalVisible(false);
    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>

      {/* Profile Info */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person-circle-outline" size={60} color="#C4C4C4" />
        </View>
        <Text style={styles.name}>Jose Risal, RN</Text>
        <Text style={styles.role}>Senior Nursing Staff</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Medications Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>8</Text>
          <Text style={styles.statLabel}>Residents</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>99.8%</Text>
          <Text style={styles.statLabel}>Accuracy Rate</Text>
        </View>
      </View>

      {/* Options */}
      <TouchableOpacity
        style={styles.optionCard}
        onPress={() => navigation.navigate("AccountSettings")}
      >
        <Ionicons name="settings-outline" size={22} color="#A75C2B" style={styles.optionIcon} />
        <Text style={styles.optionText}>Account Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.optionCard}
        onPress={() => navigation.navigate("VoiceLanguage")}
      >
        <Ionicons name="globe-outline" size={22} color="#A75C2B" style={styles.optionIcon} />
        <Text style={styles.optionText}>Voice & Language Preference</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.optionCard}
        onPress={() => navigation.navigate("DataSynch")}
      >
        <Ionicons name="cloud-outline" size={22} color="#A75C2B" style={styles.optionIcon} />
        <Text style={styles.optionText}>Data & Synchronization</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.optionCard}
        onPress={() => navigation.navigate("AboutApp")}
      >
        <Ionicons name="information-circle-outline" size={22} color="#A75C2B" style={styles.optionIcon} />
        <Text style={styles.optionText}>About This App</Text>
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => setLogoutModalVisible(true)}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* Logout Confirmation Modal */}
      <Modal
        transparent
        visible={logoutModalVisible}
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Icon */}
            <View style={styles.modalIconWrapper}>
              <Ionicons name="log-out-outline" size={32} color="#E1903A" />
            </View>

            <Text style={styles.modalTitle}>Logout</Text>
            <Text style={styles.modalMessage}>Are you sure you want to logout?</Text>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleLogout}
              >
                <Text style={styles.confirmText}>Yes, Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EFEFEF",
    paddingTop: 50,
    paddingHorizontal: 16,
  },

  profileCard: {
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingVertical: 20,
    borderRadius: 14,
    marginBottom: 20,
    elevation: 3,
  },

  avatar: {
    marginBottom: 12,
  },

  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#7A4A2E",
  },

  role: {
    fontSize: 14,
    color: "#7A4A2E",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#FFF",
    marginHorizontal: 4,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    elevation: 2,
  },

  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#7A4A2E",
  },

  statLabel: {
    fontSize: 12,
    color: "#7A4A2E",
    marginTop: 4,
    textAlign: "center",
  },

  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },

  optionIcon: {
    marginRight: 12,
  },

  optionText: {
    fontSize: 14,
    color: "#7A4A2E",
  },

  logoutButton: {
    backgroundColor: "#E1903A",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 50,
  },

  logoutText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },

  modalCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },

  modalIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FEF3E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },

  modalMessage: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },

  modalButtonRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },

  cancelButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E1903A",
    alignItems: "center",
  },

  cancelText: {
    color: "#E1903A",
    fontWeight: "700",
    fontSize: 14,
  },

  confirmButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: "#E1903A",
    alignItems: "center",
  },

  confirmText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
  },
});