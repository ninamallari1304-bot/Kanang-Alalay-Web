import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from "../../../contexts/AuthContext";
import { getInventory, createInventoryItem } from "../../../services/api";

export default function FullInventory({ navigation }) {
  const { user } = useAuth();
  const [medications, setMedications] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("pcs");
  const [creatingItem, setCreatingItem] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedItemForQr, setSelectedItemForQr] = useState(null);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const response = await getInventory();
      const inventoryData = response.data?.data || [];
      setMedications(inventoryData.map(item => ({
        id: item._id,
        name: item.name?.toUpperCase() || 'UNKNOWN MEDICATION',
        remaining: item.quantity || 0,
        ...item
      })));
    } catch (error) {
      console.error('Error loading inventory:', error);
      Alert.alert('Error', 'Failed to load medication inventory');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Filter logic
  const filteredMedications = medications.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateInventoryItem = async () => {
    const quantity = Number(newItemQuantity);
    if (!newItemName.trim()) {
      return Alert.alert('Validation', 'Item name is required.');
    }
    if (!Number.isFinite(quantity) || quantity < 0) {
      return Alert.alert('Validation', 'Please enter a valid quantity.');
    }

    setCreatingItem(true);
    try {
      const response = await createInventoryItem({
        name: newItemName.trim(),
        quantity,
        unit: newItemUnit || 'pcs',
        category: 'medication',
        minThreshold: 10,
      });
      const createdItem = response.data?.data;
      setAddModalVisible(false);
      setNewItemName('');
      setNewItemQuantity('');
      setNewItemUnit('pcs');
      await loadInventory();
      const qrNotice = createdItem?.qrCode ? `\nQR Code: ${createdItem.qrCode}` : '';
      Alert.alert('Success', `Medication added to inventory.${qrNotice}`);
    } catch (error) {
      console.error('Error creating inventory item:', error);
      Alert.alert('Error', 'Failed to add medication to inventory.');
    } finally {
      setCreatingItem(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <MaterialCommunityIcons
        name="pill"
        size={32}
        color="#E1903A"
        style={{ marginRight: 12 }}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.medName}>{item.name}</Text>
        <Text style={[styles.lowStock, item.remaining <= 10 && styles.criticalStock]}>
          {item.remaining <= 10 ? 'Critical stock' : 'In stock'} • {item.remaining} remaining
        </Text>
      </View>
      <TouchableOpacity
        style={styles.qrButton}
        onPress={() => {
          setSelectedItemForQr(item);
          setQrModalVisible(true);
        }}
      >
        <Ionicons name="qr-code" size={24} color="#E1903A" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E1903A" />
        <Text style={styles.loadingText}>Loading inventory...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color="#E45C2B" />
        </TouchableOpacity>
        <Text style={styles.title}>Medication Inventory</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#999" />
        <TextInput
          placeholder="Search medications"
          placeholderTextColor="#999"
          style={styles.searchInput}
          value={search}
          onChangeText={(text) => setSearch(text)}
        />
      </View>

      {(user?.role === 'head_caregiver' || user?.role === 'admin') && (
        <TouchableOpacity style={styles.addBtn} onPress={() => setAddModalVisible(true)}>
          <Text style={styles.addBtnText}>Add Medication</Text>
        </TouchableOpacity>
      )}

      {/* Inventory Card */}
      <View style={styles.card}>
        <FlatList
          data={filteredMedications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", padding: 20 }}>
              {search ? 'No medications found matching your search' : 'No medications in inventory'}
            </Text>
          }
        />
      </View>

      <Modal transparent visible={addModalVisible} animationType="slide" onRequestClose={() => setAddModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Medication</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Medication name"
              placeholderTextColor="#999"
              value={newItemName}
              onChangeText={setNewItemName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Quantity"
              placeholderTextColor="#999"
              value={newItemQuantity}
              onChangeText={setNewItemQuantity}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Unit (pcs, bottle, pack)"
              placeholderTextColor="#999"
              value={newItemUnit}
              onChangeText={setNewItemUnit}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleCreateInventoryItem} disabled={creatingItem}>
                {creatingItem ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={qrModalVisible}
        onRequestClose={() => setQrModalVisible(false)}
      >
        <View style={styles.qrModalOverlay}>
          <View style={styles.qrModalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setQrModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#7A4B2A" />
            </TouchableOpacity>
            <Text style={styles.qrTitle}>QR Code for {selectedItemForQr?.name}</Text>
            {selectedItemForQr && (
              <View style={styles.qrContainer}>
                <QRCode
                  value={selectedItemForQr.qrCode}
                  size={200}
                  color="#7A4B2A"
                  backgroundColor="#FFFFFF"
                />
              </View>
            )}
            <Text style={styles.qrText}>Scan this code to decrement stock</Text>
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
    paddingHorizontal: 20,
    paddingTop: 50,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#7A4A2E",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#7A4B2A",
    marginLeft: 15,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 45,
    elevation: 3,
    marginBottom: 20,
  },
  searchInput: {
    marginLeft: 10,
    flex: 1,
    fontSize: 14,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 10,
    elevation: 4,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  medName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7A4B2A",
  },
  lowStock: {
    fontSize: 12,
    color: "#E1903A",
    marginTop: 4,
  },
  criticalStock: {
    color: "#E53935",
    fontWeight: "bold",
  },
  separator: {
    height: 1,
    backgroundColor: "#E5E5E5",
  },
  addBtn: {
    backgroundColor: "#E1903A",
    borderRadius: 25,
    paddingVertical: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  addBtnText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  qrButton: {
    padding: 8,
  },
  qrModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  qrModalContent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    width: "80%",
  },
  closeButton: {
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#7A4B2A",
    marginBottom: 20,
    textAlign: "center",
  },
  qrContainer: {
    marginBottom: 20,
  },
  qrText: {
    fontSize: 14,
    color: "#7A4B2A",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#7A4B2A",
    marginBottom: 15,
  },
  modalInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    color: "#333",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E1903A",
    paddingVertical: 12,
    marginRight: 8,
    alignItems: "center",
  },
  saveBtn: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "#E1903A",
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: "center",
  },
  cancelText: {
    color: "#E1903A",
    fontWeight: "bold",
  },
  saveText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});
