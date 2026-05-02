import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function ResidentFilters({ active, navigation }) {
  return (
    <View style={styles.filterRow}>

      {/* ALL */}
      <TouchableOpacity
        style={active === "allres" ? styles.filterActive : styles.filterOutline}
        onPress={() => navigation.navigate("AllRes")}
      >
        <Text style={active === "allres" ? styles.filterActiveText : styles.filterOutlineText}>
          All
        </Text>
      </TouchableOpacity>

      {/* MY ASSIGNED */}
      <TouchableOpacity
        style={active === "assignres" ? styles.filterActive : styles.filterOutline}
        onPress={() => navigation.navigate("MyAssignRes")}
      >
        <Text style={active === "assignres" ? styles.filterActiveText : styles.filterOutlineText}>
          My Assigned
        </Text>
      </TouchableOpacity>

      {/* BY WARD */}
      <TouchableOpacity
        style={active === "byward" ? styles.filterActive : styles.filterOutline}
        onPress={() => navigation.navigate("ByWard")}
      >
        <Text style={active === "byward" ? styles.filterActiveText : styles.filterOutlineText}>
          By Ward
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
