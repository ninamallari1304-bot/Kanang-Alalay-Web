import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ResidentFilters from '../../../components/ResidentFilters';
import { getResidents } from "../../../services/api";

export default function AllResidents({ navigation }) {
  const [search, setSearch] = useState('');
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      const res = await getResidents();
      const residentsArray = res.data?.data || res.data || [];
      setResidents(Array.isArray(residentsArray) ? residentsArray : []);
    } catch (error) {
      console.error('Fetch residents error:', error);
      setResidents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredResidents = (residents || []).filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderResident = ({ item }) => (
    <TouchableOpacity style={styles.residentCard} 
      onPress={() => navigation.navigate("MedicationFor", { resident: item })}>
      <Ionicons name="person-circle-outline" size={40} color="#C4C4C4" style={{ marginRight: 10 }} />
      <View>
        <Text style={styles.residentName}>{item.name}</Text>
        <Text style={styles.residentRoom}>Room {item.room}</Text>
        {item.medications?.length > 0 && (
          <Text style={styles.residentMeds}>{item.medications.length} medications</Text>
        )}
      </View>
    </TouchableOpacity>
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
        <Text style={styles.title}>Select Resident</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#B0B0B0" style={{ marginLeft: 10 }} />
        <TextInput
          placeholder="Search Residents"
          placeholderTextColor="#919191"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      <ResidentFilters active="allres" navigation={navigation} />

      <FlatList
        data={filteredResidents}
        renderItem={renderResident}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListEmptyComponent={<Text style={styles.emptyText}>No residents found</Text>}
      />
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

  card: {
    flex: 1,
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    borderRadius: 14,
    paddingVertical: 10,
    elevation: 3,
  },

  scheduleItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },

  scheduleText: {
    color: "#7A4A2E",
  },

    searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 15,
    paddingVertical: 8,
  },

  searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },

  residentCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    alignItems: "center",
    elevation: 2,
  },

  residentName: { fontSize: 15, fontWeight: "bold", color: "#7A4A2E" },
  residentRoom: { fontSize: 12, color: "#7A4A2E" },
  residentMeds: { fontSize: 12, color: "#A75C2B", marginTop: 2 },
});