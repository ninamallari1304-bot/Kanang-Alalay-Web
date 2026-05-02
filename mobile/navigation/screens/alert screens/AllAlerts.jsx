import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAlerts, markAllAlertsRead } from "../../services/api";

export default function AllAlerts({navigation}) {
  const [activeTab, setActiveTab] = useState("Unread");
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const response = await getAlerts();
      const alertData = response.data || [];
      setAlerts(alertData.map(alert => ({
        id: alert._id,
        type: alert.type?.toUpperCase() || 'ALERT',
        message: alert.message || alert.title || 'Alert notification',
        sub: alert.description || '',
        color: getAlertColor(alert.type),
        unread: !alert.read,
        timestamp: alert.createdAt
      })));
    } catch (error) {
      console.error('Error loading alerts:', error);
      Alert.alert('Error', 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const getAlertColor = (type) => {
    const colors = {
      'SIDE EFFECT': '#E53935',
      'LOW STOCK': '#D4C600',
      'MEDICATION ADMINISTERED': '#C4511E',
      'DELAYED PATIENT': '#E67E22',
      'VITAL SIGNS': '#27AE60',
      'EMERGENCY': '#E74C3C'
    };
    return colors[type?.toUpperCase()] || '#E1903A';
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAlertsRead();
      setAlerts(prev => prev.map(alert => ({ ...alert, unread: false })));
      Alert.alert('Success', 'All alerts marked as read');
    } catch (error) {
      console.error('Error marking alerts read:', error);
      Alert.alert('Error', 'Failed to mark alerts as read');
    }
  };

  const filteredAlerts =
    activeTab === "Unread"
      ? alerts.filter((a) => a.unread)
      : alerts;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E1903A" />
        <Text style={styles.loadingText}>Loading alerts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate("Main", { screen: "Home" })}>
            <Ionicons name="arrow-back" size={26} color="#E45C2B" />
          </TouchableOpacity>

          <Text style={styles.title}>Alerts & Notifications</Text>
        </View>

      {/* Tabs */}
      <View style={styles.tabRow}>

        <TouchableOpacity
        style={[
            styles.tab,
            activeTab === "All" && styles.activeTabFilled,
        ]}
        onPress={() => setActiveTab("All")}
        >
        <Text
            style={[
            styles.tabText,
            activeTab === "All" && styles.activeTabTextFilled,
            ]}
        >
            All
        </Text>
        </TouchableOpacity>

        <TouchableOpacity
        style={[
            styles.tab,
            activeTab === "Unread" && styles.activeTabFilled,
        ]}
        onPress={() => setActiveTab("Unread")}
        >
        <Text
            style={[
            styles.tabText,
            activeTab === "Unread" && styles.activeTabTextFilled,
            ]}
        >
            Unread
        </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.showingText}>
        Showing : {activeTab} Notifications ({filteredAlerts.length})
      </Text>

      {/* Alert List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <View key={alert.id} style={styles.card}>
              <View
                style={[
                  styles.statusCircle,
                  { borderColor: alert.color },
                ]}
              >
                <View
                  style={[
                    styles.innerCircle,
                    { backgroundColor: alert.color },
                  ]}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.alertType}>{alert.type}:</Text>
                <Text style={styles.alertMessage}>{alert.message}</Text>
                {alert.sub ? (
                  <Text style={styles.alertSub}>{alert.sub}</Text>
                ) : null}
                {alert.timestamp && (
                  <Text style={styles.alertTime}>
                    {new Date(alert.timestamp).toLocaleDateString()}
                  </Text>
                )}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No {activeTab.toLowerCase()} alerts</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Button */}
      {filteredAlerts.length > 0 && (
        <TouchableOpacity style={styles.bottomBtn} onPress={handleMarkAllRead}>
          <Text style={styles.bottomBtnText}>Mark All Read</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F4",
    paddingHorizontal: 20,
    paddingTop: 50,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F4F4",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#7A4A2E",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 1,
    marginBottom: 15,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#7A4A2E",
    marginLeft: 12,
  },

  tabRow: {
    flexDirection: "row",
    marginBottom: 10,
  },

  tab: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E08A3C",
  },

  activeTabFilled: {
    backgroundColor: "#D96F2C",
    borderColor: "#D96F2C",
  },

  activeTabOutline: {
    backgroundColor: "#FFF",
  },

  tabText: {
    fontWeight: "600",
    color: "#D96F2C",
  },

  activeTabTextFilled: {
    color: "#FFF",
  },

  activeTabTextOutline: {
    color: "#D96F2C",
  },

  showingText: {
    fontSize: 14,
    color: "#7A4A2E",
    marginBottom: 15,
    fontWeight: "500",
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  statusCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  innerCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  alertType: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#7A4A2E",
    textTransform: "uppercase",
    marginBottom: 4,
  },

  alertMessage: {
    fontSize: 14,
    color: "#333",
    marginBottom: 2,
  },

  alertSub: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },

  alertTime: {
    fontSize: 11,
    color: "#999",
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

  bottomBtn: {
    backgroundColor: "#E1903A",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },

  bottomBtnText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },
});

  showingText: {
    color: "#7A4A1D",
    marginBottom: 15,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  statusCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  innerCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  alertType: {
    fontSize: 12,
    fontWeight: "700",
    color: "#7A4A1D",
  },

  alertMessage: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 2,
  },

  alertSub: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },

  bottomBtn: {
    backgroundColor: "#D96F2C",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginVertical: 15,
  },

  bottomBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
    