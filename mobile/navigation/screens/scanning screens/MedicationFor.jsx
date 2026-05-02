import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getResidentMedications } from "../../../services/api";

export default function MedicationFor({ navigation, route }) {

  const { resident } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [medications, setMedications] = useState([]);

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      const res = await getResidentMedications(resident._id);
      setMedications(res.data);
    } catch (error) {
      console.error('Fetch medications error:', error);
    }
  };

  const handleConfirm = () => {
    setModalVisible(false);
    navigation.navigate("Scanner", { resident });
  };

  const handleScan = (medication) => {
    navigation.navigate("Scanner", { resident, medication });
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("AllRes")}>
          <Ionicons name="arrow-back" size={26} color="#E45C2B" />
        </TouchableOpacity>
        <Text style={styles.title}>Medication for</Text>
      </View>

      {/* Resident Name BELOW HEADER */}
      <Text style={styles.residentHeaderName}>
        {resident.name}
      </Text>

      {/* Resident Info Card */}
      <View style={styles.residentCard}>
        <Ionicons name="person-circle-outline" size={40} color="#C4C4C4" />
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.residentName}>{resident.name}</Text>
          <Text style={styles.residentRoom}>Room {resident.room}</Text>
        </View>
      </View>

      {/* Medication Cards */}
      <ScrollView showsVerticalScrollIndicator={false}>

        {medications.map((med, index) => (
          <View key={index} style={styles.medCard}>
            <View style={styles.medRow}>
              <Ionicons name="checkmark-circle" size={22} color="#4CAF50" />
              <Text style={styles.medTitle}>{med.name}</Text>
            </View>
            <Text style={styles.medSub}>{med.dosage} {med.form}</Text>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleScan(med)}
            >
              <Text style={styles.actionText}>SCAN TO VERIFY</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Sample Med 1 */}
        {/* <View style={styles.medCard}>
          <View style={styles.medRow}>
            <Ionicons name="checkmark-circle" size={22} color="#4CAF50" />
            <Text style={styles.medTitle}>PARACETAMOL 500mg</Text>
          </View>
          <Text style={styles.medSub}>1 tablet Oral</Text>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.actionText}>SCAN TO VERIFY</Text>
          </TouchableOpacity>
        </View> */}

        {/* Sample Med 2 */}
        {/* <View style={styles.medCard}>
          <View style={styles.medRow}>
            <Ionicons name="time-outline" size={22} color="#999" />
            <Text style={styles.medTitle}>LOSARTAN 50mg</Text>
          </View>
          <Text style={styles.medSub}>1 capsule Oral</Text>
          <TouchableOpacity style={styles.actionBtnLight}>
            <Text style={styles.actionTextLight}>SCHEDULE LATER</Text>
          </TouchableOpacity>
        </View> */}

      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>

            <View style={styles.modalIconWrapper}>
              <Ionicons name="scan-outline" size={32} color="#E45C2B" />
            </View>

            <Text style={styles.modalTitle}>Confirm Scanning</Text>
            <Text style={styles.modalMessage}>
              Please confirm to proceed with medicine scanning.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmText}>Confirm</Text>
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
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 15,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#7A4A2E",
    marginLeft: 12,
  },

  headerSub: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#7A4A2E",
    marginLeft: 12,
  },

  residentHeaderName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#7A4A2E",
    marginHorizontal: 16,
    marginBottom: 12,
  },

  residentCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    marginBottom: 16,
    elevation: 2,
  },

  residentName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#7A4A2E",
  },

  residentRoom: {
    fontSize: 12,
    color: "#7A4A2E",
  },

  medCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },

  medRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  medTitle: {
    marginLeft: 8,
    fontWeight: "bold",
    color: "#7A4A2E",
  },

  medSub: {
    marginTop: 4,
    marginLeft: 30,
    fontSize: 12,
    color: "#999",
  },

  actionBtn: {
    marginTop: 12,
    alignSelf: "flex-end",
    backgroundColor: "#EED9B8",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },

  actionBtnLight: {
    marginTop: 12,
    alignSelf: "flex-end",
    backgroundColor: "#F4F4F4",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },

  actionText: {
    fontSize: 12,
    color: "#7A4A2E",
    fontWeight: "600",
  },

  actionTextLight: {
    fontSize: 12,
    color: "#7A4A2E",
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    width: "80%",
    alignItems: "center",
    elevation: 6,
  },

  modalIconWrapper: {
    backgroundColor: "#FFF3EC",
    borderRadius: 50,
    padding: 12,
    marginBottom: 14,
  },

  modalTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#7A4A2E",
    marginBottom: 8,
  },

  modalMessage: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },

  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },

  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
      borderWidth: 1,
    borderColor: "#DDD",
    alignItems: "center",
  },

  cancelText: {
    fontSize: 13,
    color: "#999",
    fontWeight: "600",
  },

  confirmBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#E6953B",
    alignItems: "center",
  },

  confirmText: {
    fontSize: 13,
    color: "#FFF",
    fontWeight: "600",
  },

});