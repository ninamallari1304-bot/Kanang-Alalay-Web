import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScheduleFilters from "../../../components/ScheduleFilters";
import { getTodaySchedule } from "../../../services/api";

export default function MyAssignedSchedule({ navigation }) {
  const [assignedSchedule, setAssignedSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignedSchedule();
  }, []);

  const loadAssignedSchedule = async () => {
    setLoading(true);
    try {
      const response = await getTodaySchedule();
      const scheduleData = response.data?.data || response.data || [];
      setAssignedSchedule(scheduleData.map(item => ({
        id: item._id,
        time: item.scheduledTime ? new Date(item.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD',
        description: item.medicationName || item.name || item.title || 'Medication Round',
        resident: item.residentName || item.patientName || item.resident || 'Assigned resident',
        completed: item.status === 'completed' || item.administered,
        ...item
      })));
    } catch (error) {
      console.error('Error loading assigned schedule:', error);
      Alert.alert('Error', 'Failed to load assigned schedule');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E1903A" />
        <Text style={styles.loadingText}>Loading assigned schedule...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <View>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate("Main", { screen: "Home" })}>
            <Ionicons name="arrow-back" size={26} color="#E45C2B" />
          </TouchableOpacity>

          <Text style={styles.title}>My Assigned Schedule</Text>
        </View>

        {/* Filters */}
        <ScheduleFilters active="assigned" navigation={navigation} />
      </View>

      {/* Assigned List */}
      <ScrollView style={styles.card}>
        {assignedSchedule.length > 0 ? (
          assignedSchedule.map((item, index) => (
            <TouchableOpacity key={item.id || index} style={styles.scheduleItem}>
              <View style={styles.scheduleRow}>
                <Text style={styles.scheduleTime}>{item.time}</Text>
                <Text style={[styles.scheduleText, item.completed && styles.completedText]}>
                  {item.description} {item.completed ? '(Completed)' : ''}
                </Text>
              </View>
              <Text style={styles.scheduleResident}>{item.resident}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No assigned schedule items found</Text>
          </View>
        )}
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EFEFEF",
    paddingTop: 50,
  },

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

  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  scheduleTime: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#E45C2B",
    marginRight: 12,
    minWidth: 60,
  },

  scheduleText: {
    color: "#7A4A2E",
    flex: 1,
  },

  completedText: {
    textDecorationLine: "line-through",
    color: "#A75C2B",
  },

  scheduleResident: {
    fontSize: 12,
    color: "#A75C2B",
    marginTop: 2,
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
