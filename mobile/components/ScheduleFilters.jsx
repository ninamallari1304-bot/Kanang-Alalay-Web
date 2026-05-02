import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function ScheduleFilters({ active, navigation }) {
  return (
    <View style={styles.filterRow}>

      {/* ALL */}
      <TouchableOpacity
        style={active === "all" ? styles.filterActive : styles.filterOutline}
        onPress={() => navigation.navigate("Schedule")}
      >
        <Text style={active === "all" ? styles.filterActiveText : styles.filterOutlineText}>
          All
        </Text>
      </TouchableOpacity>

      {/* MY ASSIGNED */}
      <TouchableOpacity
        style={active === "assigned" ? styles.filterActive : styles.filterOutline}
        onPress={() => navigation.navigate("AssignedSchedule")}
      >
        <Text style={active === "assigned" ? styles.filterActiveText : styles.filterOutlineText}>
          My Assigned
        </Text>
      </TouchableOpacity>

      {/* URGENT */}
      <TouchableOpacity
        style={active === "urgent" ? styles.filterActive : styles.filterOutline}
        onPress={() => navigation.navigate("UrgentSchedule")}
      >
        <Text style={active === "urgent" ? styles.filterActiveText : styles.filterOutlineText}>
          Urgent
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 15,
  },

  filterActive: {
    backgroundColor: "#E1903A",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },

  filterActiveText: {
    color: "#FFF",
  },

  filterOutline: {
    borderWidth: 1,
    borderColor: "#E45C2B",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },

  filterOutlineText: {
    color: "#E45C2B",
  },
});
