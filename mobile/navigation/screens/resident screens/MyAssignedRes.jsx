import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ResidentFilters from '../../../components/ResidentFilters';
import { getMyAssignedResidents } from '../../../services/api';

export default function MyAssignedRes({ navigation }) {
  const [residentsData, setResidentsData] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignedResidents();
  }, []);

  const loadAssignedResidents = async () => {
    setLoading(true);
    try {
      const response = await getMyAssignedResidents();
      const residentsArray = response.data?.data || response.data || [];
      const residents = Array.isArray(residentsArray) ? residentsArray : [];
      setResidentsData(residents.map(resident => ({
        id: resident._id,
        name: `${resident.firstName} ${resident.lastName}`,
        room: resident.roomNumber || 'N/A',
        meds: resident.medications ? `${resident.medications.length} medications due` : 'No medications',
        ...resident
      })));
    } catch (error) {
      console.error('Error loading assigned residents:', error);
      setResidentsData([]);
      Alert.alert('Error', 'Failed to load assigned residents');
    } finally {
      setLoading(false);
    }
  };

  const filteredResidents = (residentsData || []).filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderResident = ({ item }) => (
    <TouchableOpacity style={styles.residentCard} onPress={() => navigation.navigate("MedicationFor", { resident: item })}>
      <Ionicons name="person-circle-outline" size={40} color="#C4C4C4" style={{ marginRight: 10 }} />

      <View>
        <Text style={styles.residentName}>{item.name}</Text>
        <Text style={styles.residentRoom}>Room {item.room}</Text>
        {item.meds && <Text style={styles.residentMeds}>{item.meds}</Text>}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E1903A" />
        <Text style={styles.loadingText}>Loading assigned residents...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <View>
        {/* Header */}
        <View style={styles.header}>

          <Text style={styles.title}>Select Resident</Text>
        </View>

      </View>

      {/* Search */}
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

      {/* Filters */}
      <ResidentFilters active="assignres" navigation={navigation} />

      {/* List */}
      <FlatList
        data={filteredResidents}
        renderItem={renderResident}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No assigned residents found</Text>
          </View>
        }
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

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EFEFEF",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#7A4A2E",
  },

  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },

  emptyText: {
    fontSize: 16,
    color: "#7A4A2E",
    textAlign: "center",
  },
});
