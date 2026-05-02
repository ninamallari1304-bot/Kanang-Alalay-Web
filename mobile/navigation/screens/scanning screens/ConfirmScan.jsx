import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function ConfirmScan({ navigation, route }) {
  return (
    <View style={styles.container}>

      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.cardText}>
          Please confirm to proceed with medicine scanning.
        </Text>
      </View>

      {/* Confirm Button */}
      <TouchableOpacity
        style={styles.confirmBtn}
        onPress={() => navigation.navigate("Scanner", { resident: route.params?.resident })}
      >
        <Text style={styles.confirmText}>Confirm</Text>
      </TouchableOpacity>

      {/* Go Back Button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>Go Back</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F3F3",
    paddingTop: 80,
    alignItems: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#7A4A2E",
    alignSelf: "flex-start",
    marginLeft: 24,
    marginBottom: 40,
  },

  card: {
    width: "85%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingVertical: 35,
    paddingHorizontal: 25,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    marginBottom: 40,
  },

  cardText: {
    textAlign: "center",
    fontSize: 16,
    color: "#7A4A2E",
    fontWeight: "600",
    lineHeight: 24,
  },

  confirmBtn: {
    width: 160,
    backgroundColor: "#E6953B",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 14,
    elevation: 2,
  },

  confirmText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 15,
  },

  backBtn: {
    width: 160,
    backgroundColor: "#C9C9C9",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  backText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 15,
  },
});
