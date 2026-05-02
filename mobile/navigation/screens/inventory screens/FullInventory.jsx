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
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { getInventory } from "../../../services/api";

export default function FullInventory({ navigation }) {
  const [medications, setMedications] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const response = await getInventory();
      const inventoryData = response.data || [];
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
});
