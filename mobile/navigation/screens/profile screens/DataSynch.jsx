import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from "react-native";
import React, { useState } from 'react'
import { Ionicons } from "@expo/vector-icons";

export default function DataSynch({navigation}) {
  const [clinicalGuidelines, setClinicalGuidelines] = useState(true);
  const [offlineMode, setOfflineMode] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Main", { screen: "Profile" })}>
          <Ionicons name="arrow-back" size={26} color="#E45C2B" />
        </TouchableOpacity>

        <Text style={styles.title}>Data & Synchronization</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Last Sync Info */}
        <View style={styles.syncCard}>
          <Text style={styles.syncText}>Last Sync: Feb, 11    11:15 PM</Text>
        </View>

        {/* Enable Clinical Guidelines */}
        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Enable Clinical Guidelines</Text>
            <Switch
              value={clinicalGuidelines}
              onValueChange={setClinicalGuidelines}
              trackColor={{ false: "#D1D1D1", true: "#FFD700" }}
              thumbColor={clinicalGuidelines ? "#FFA500" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Offline Mode */}
        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Offline Mode</Text>
            <Switch
              value={offlineMode}
              onValueChange={setOfflineMode}
              trackColor={{ false: "#D1D1D1", true: "#FFD700" }}
              thumbColor={offlineMode ? "#FFA500" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Stored Data */}
        <View style={styles.dataCard}>
          <Text style={styles.dataText}>Stored Data: 150 MB</Text>
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

  syncCard: {
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

  syncText: {
    fontSize: 15,
    color: "#333333",
  },

  settingCard: {
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

  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  settingText: {
    fontSize: 15,
    color: "#333333",
    flex: 1,
  },

  dataCard: {
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

  dataText: {
    fontSize: 15,
    color: "#333333",
  },
});