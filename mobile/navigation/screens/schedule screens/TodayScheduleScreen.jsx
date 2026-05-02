import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScheduleFilters from "../../../components/ScheduleFilters";
import { getAlerts } from "../../../services/api";

export default function TodayScheduleScreen({ navigation }) {

  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const res = await getAlerts();
      // Map alerts to schedule items
      const scheduleItems = res.data.map(alert => `${alert.createdAt.split('T')[0]} - ${alert.message}`);
      setSchedule(scheduleItems);
    } catch (error) {
      console.error('Fetch schedule error:', error);
      setSchedule(["8:00 AM - Breakfast Meds (Completed)", "9:00 AM - Breakfast Meds", "10:30 AM - Morning Rounds (3 residents)", "10:45 AM - Lola Maria's Antibiotics", "11:30 AM - Vital Signs Check", "12:00 PM - Lunch", "2:00 PM - Physical Therapy (Room 210)", "7:30 PM - Medication Round (5 residents)", "8:00 PM - Dinner", "8:00 PM - Dinner Meds"]); // fallback
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

          <Text style={styles.title}>Today’s Schedule</Text>
        </View>

        {/* Filters */}
        <ScheduleFilters active="all" navigation={navigation} />
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
