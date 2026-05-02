import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import React from 'react'
import { Ionicons } from "@expo/vector-icons";

export default function AboutApp({navigation}) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Main", { screen: "Profile" })}>
          <Ionicons name="arrow-back" size={26} color="#E45C2B" />
        </TouchableOpacity>
        <Text style={styles.title}>About This App</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Version Card */}
        <View style={styles.card}>
          <Text style={styles.versionText}>App Version 2.3.1</Text>
          <Text style={styles.buildText}>(Build 462)</Text>
        </View>

        {/* Service Status Card */}
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <Text style={styles.labelText}>Service Status:</Text>
            <Text style={styles.activeText}>Active</Text>
          </View>
        </View>

        {/* Submit Incident Report Button */}
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Submit Incident Report</Text>
        </TouchableOpacity>

        {/* Terms & Open-Source Licenses Button */}
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Terms & Open-Source Licenses</Text>
        </TouchableOpacity>

        {/* Location Sharing Card */}
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <Text style={styles.labelText}>Location Sharing</Text>
            <Text style={styles.enabledText}>Enabled</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EFEFEF",
    paddingTop: 30,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#7A4A2E",
    marginLeft: 12,
  },

  content: {
    flex: 1,
    paddingHorizontal: 16,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  versionText: {
    fontSize: 15,
    color: "#333333",
    marginBottom: 4,
  },

  buildText: {
    fontSize: 14,
    color: "#666666",
  },

  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  labelText: {
    fontSize: 15,
    color: "#333333",
  },

  activeText: {
    fontSize: 15,
    color: "#4CAF50",
    fontWeight: "500",
  },

  enabledText: {
    fontSize: 15,
    color: "#333333",
    fontWeight: "500",
  },

  button: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  buttonText: {
    fontSize: 15,
    color: "#333333",
  },
});