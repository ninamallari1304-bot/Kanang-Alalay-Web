// import { getInventory, getLowStock } from "../services/api";
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { getInventory, getLowStock } from "../../services/api";

export default function InventoryScreen({ navigation }) {
  const [inventory, setInventory] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const [inventoryRes, lowStockRes] = await Promise.all([
        getInventory(),
        getLowStock()
      ]);
      setInventory(inventoryRes.data);
      setLowStockItems(lowStockRes.data);
    } catch (error) {
      console.error('Fetch inventory error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderLowStock = ({ item }) => (
    <View style={styles.lowItem}>
      <MaterialCommunityIcons name="pill" size={32} color="#E1903A" style={{ marginRight: 12 }} />
      <View>
        <Text style={styles.medName}>{item.name}</Text>
        <Text style={styles.medSub}>
          Low stock • {item.quantity} {item.unit} remaining
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E1903A" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Medication Inventory</Text>
      </View>

      <View style={styles.cardRow}>
        <View style={styles.card}>
          <MaterialCommunityIcons name="pill" size={28} color="#E1903A" />
          <Text style={styles.cardNumber}>{inventory.length}</Text>
          <Text style={styles.cardLabel}>Items</Text>
        </View>

        <View style={styles.card}>
          <Ionicons name="warning-outline" size={28} color="#E1903A" />
          <Text style={styles.cardNumber}>{lowStockItems.length}</Text>
          <Text style={styles.cardLabel}>Low Stock</Text>
        </View>

        <View style={styles.card}>
          <Ionicons name="alert-circle-outline" size={28} color="#E1903A" />
          <Text style={styles.cardNumber}>0</Text>
          <Text style={styles.cardLabel}>Expiring</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Low stock alerts</Text>

      <View style={styles.lowContainer}>
        <FlatList
          data={lowStockItems}
          renderItem={renderLowStock}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={<Text style={styles.emptyText}>No low stock items</Text>}
        />
      </View>

      <TouchableOpacity style={styles.fullBtn} onPress={() => navigation.navigate("FullInv")}>
        <Text style={styles.fullText}>VIEW FULL INVENTORY</Text>
      </TouchableOpacity>
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
    marginBottom: 16,
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#7A4A2E",
    marginLeft: 10,
  },

  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 16,
  },

  card: {
    backgroundColor: "#FFF",
    width: "30%",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    elevation: 3,
  },

  cardNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#7A4A2E",
  },

  cardLabel: {
    fontSize: 12,
    color: "#7A4A2E",
  },

  scanBtn: {
    backgroundColor: "#E1903A",
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 16,
  },

  scanText: {
    color: "#FFF",
    fontWeight: "bold",
    textAlign: "center",
  },

  sectionTitle: {
    marginHorizontal: 16,
    fontWeight: "bold",
    color: "#7A4A2E",
    marginBottom: 8,
  },

  lowContainer: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 12,
    elevation: 3,
  },

  lowItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },

  medName: {
    fontWeight: "bold",
    color: "#7A4A2E",
  },

  medSub: {
    fontSize: 12,
    color: "#A75C2B",
  },

  fullBtn: {
    backgroundColor: "#E1903A",
    margin: 16,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },

  fullText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});