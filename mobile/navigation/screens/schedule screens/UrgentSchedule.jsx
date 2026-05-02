import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScheduleFilters from "../../../components/ScheduleFilters";
import { getUnreadAlerts } from "../../../services/api";

export default function UrgentSchedule({ navigation }) {

  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    fetchUrgentSchedule();
  }, []);

  const fetchUrgentSchedule = async () => {
    try {
      const res = await getUnreadAlerts();
      const scheduleItems = res.data.map(alert => `${alert.createdAt.split('T')[0]} - ${alert.message}`);
      setSchedule(scheduleItems);
    } catch (error) {
      console.error('Fetch urgent schedule error:', error);
      setSchedule(["9:00 AM - Breakfast Meds"]); // fallback
    }
  };

  return (
    <View style={styles.container}>

      <View>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate("Main", { screen: "Home" })}>
            <Ionicons name="arrow-back" size={26} color="#E45C2B" />
          </TouchableOpacity>

          <Text style={styles.title}>Urgent Schedule</Text>
        </View>

        {/* Filters */}
        <ScheduleFilters active="urgent" navigation={navigation} />
      </View>

      {/* Schedule List */}
      <ScrollView style={styles.card}>
        {schedule.map((item, index) => (
          <TouchableOpacity key={index} style={styles.scheduleItem}>
            <Text style={styles.scheduleText}>{item}</Text>
          </TouchableOpacity>
        ))}
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
});
