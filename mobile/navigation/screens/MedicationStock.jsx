import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { getMedications, updateMedicationStock } from "../../services/api";

export default function MedicationStock({ navigation }) {
  const { user } = useAuth();
  const [medications, setMedications] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [stockAmount, setStockAmount] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    setLoading(true);
    try {
      const response = await getMedications();
      const meds = response.data?.data || [];
      setMedications(meds);
    } catch (error) {
      console.error("Load medications error:", error);
      Alert.alert("Error", "Unable to load medication stock.");
    } finally {
      setLoading(false);
    }
  };

  const openStockModal = (med) => {
    setSelectedMedication(med);
    setStockAmount("");
    setModalVisible(true);
  };

  const handleAddStock = async () => {
    const amount = Number(stockAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return Alert.alert("Invalid quantity", "Please enter a positive number to add stock.");
    }

    setUpdating(true);
    try {
      await updateMedicationStock(selectedMedication._id, { amount });
      Alert.alert("Success", `${selectedMedication.name} stock updated.`);
      setModalVisible(false);
      await loadMedications();
    } catch (error) {
      console.error("Update stock error:", error);
      Alert.alert("Error", "Failed to update medication stock.");
    } finally {
      setUpdating(false);
    }
  };

  const filteredMedications = medications.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>Loading user data...</Text>
      </View>
    );
  }

  if (user.role !== "head_caregiver") {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>Access denied.</Text>
        <Text style={styles.subMessage}>
          Medication stock management is available for Head Caregiver accounts only.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#E45C2B" />
        </TouchableOpacity>
        <Text style={styles.title}>Medication Stock</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#999" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search medications"
          placeholderTextColor="#999"
          style={styles.searchInput}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E1903A" />
        </View>
      ) : (
        <FlatList
          data={filteredMedications}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.message}>No medications found.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.row}>
                <MaterialCommunityIcons name="pill" size={30} color="#E1903A" />
                <View style={styles.cardText}>
                  <Text style={styles.medName}>{item.name}</Text>
                  <Text style={styles.medSub}>Current: {item.stock?.current ?? 0} {item.stock?.unit || ''}</Text>
                  <Text style={styles.medDetail}>Min: {item.stock?.minimum ?? '--'} • Max: {item.stock?.maximum ?? '--'}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.actionBtn} onPress={() => openStockModal(item)}>
                <Text style={styles.actionText}>Add Stock</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <Modal transparent visible={modalVisible} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Stock</Text>
            <Text style={styles.modalLabel}>{selectedMedication?.name}</Text>
            <TextInput
              style={styles.modalInput}
              value={stockAmount}
              onChangeText={setStockAmount}
              placeholder="Enter amount to add"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddStock} disabled={updating}>
                {updating ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.saveText}>Save</Text>
                )}
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
    backgroundColor: "#F5F5F5",
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#7A4A2E",
    marginLeft: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 45,
    elevation: 3,
    marginBottom: 16,
  },
  searchInput: {
    marginLeft: 10,
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  message: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  subMessage: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    marginBottom: 12,
    padding: 16,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardText: {
    marginLeft: 12,
    flex: 1,
  },
  medName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#7A4A2E",
  },
  medSub: {
    marginTop: 6,
    fontSize: 13,
    color: "#A75C2B",
  },
  medDetail: {
    marginTop: 4,
    fontSize: 12,
    color: "#7A4A2E",
  },
  actionBtn: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  actionText: {
    color: "#FFF",
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#7A4A2E",
    marginBottom: 10,
  },
  modalLabel: {
    fontSize: 14,
    color: "#555",
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#333",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelBtn: {
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    marginRight: 10,
  },
  cancelText: {
    color: "#374151",
    fontWeight: "700",
  },
  saveBtn: {
    backgroundColor: "#E1903A",
    borderRadius: 12,
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveText: {
    color: "#FFF",
    fontWeight: "700",
  },
});
