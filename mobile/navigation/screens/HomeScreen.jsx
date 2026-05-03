import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { getResidents, getTodaySchedule } from "../../services/api";

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    residents: 0,
    lowStockCount: 0,
    unreadAlerts: 0
  });
  const [schedule, setSchedule] = useState([]);
  const [lastScan, setLastScan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [residentsRes, scheduleRes, storedLastScan] = await Promise.all([
        getResidents(),
        getTodaySchedule(),
        AsyncStorage.getItem('lastScan')
      ]);

      const todayData = scheduleRes?.data?.data || scheduleRes?.data || [];
      const residentsArray = residentsRes.data?.data || residentsRes.data || [];
      setStats({
        residents: Array.isArray(residentsArray) ? residentsArray.length : 0,
        lowStockCount: 0,
        unreadAlerts: 0
      });
      setSchedule(todayData.slice(0, 3));
      setLastScan(storedLastScan ? JSON.parse(storedLastScan) : null);
    } catch (error) {
      console.error('Dashboard load error:', error);
      Alert.alert('Dashboard error', 'Unable to load dashboard data at this time.');
    } finally {
      setLoading(false);
    }
  };

  const shiftLabel = user?.shift
    ? `${user.shift.charAt(0).toUpperCase()}${user.shift.slice(1)}`
    : 'Morning';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E1903A" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerBar}>
          <View>
            <Text style={styles.greeting}>Welcome Back, {user?.firstName || 'Caregiver'}!</Text>
            <Text style={styles.subGreeting}>{user?.role?.replace('_', ' ') || 'Caregiver'} · Shift: {shiftLabel}</Text>
          </View>
          <TouchableOpacity style={styles.voiceIconButton} onPress={() => navigation.navigate('VoiceAssistant')}>
            <Ionicons name="volume-high" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <StatCard icon={<Ionicons name="people-outline" size={24} color="#E45C2B" />} label="Total Residents" value={stats.residents.toString()} />
          <StatCard icon={<MaterialIcons name="warning" size={24} color="#E45C2B" />} label="Low Stock" value={stats.lowStockCount.toString()} />
          <StatCard icon={<Ionicons name="notifications-outline" size={24} color="#E45C2B" />} label="Unread Alerts" value={stats.unreadAlerts.toString()} />
        </View>

        {lastScan && (
          <View style={[styles.card, styles.lastScanCard]}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Last Scan Result</Text>
              <Text style={styles.cardMeta}>{lastScan.matchStatus === 'match' ? 'Matched' : 'Mismatch'}</Text>
            </View>
            <Text style={styles.lastScanText}>{lastScan.medicationName}</Text>
            <Text style={styles.lastScanSub}>{lastScan.notes}</Text>
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Today’s Schedule</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Schedule')}>
              <Text style={styles.linkText}>See All</Text>
            </TouchableOpacity>
          </View>
          {schedule.length > 0 ? (
            schedule.map((item, index) => (
              <View key={index} style={styles.scheduleItem}>
                <View style={styles.scheduleTimeBox}>
                  <Text style={styles.scheduleTime}>{new Date(item.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
                <View style={styles.scheduleContent}>
                  <Text style={styles.scheduleText}>{item.medicationName || item.name || item.title || 'Medication Round'}</Text>
                  <Text style={styles.scheduleMeta}>{item.residentName || item.patientName || item.resident || 'Assigned resident'}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No schedule items found for today.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.quickRow}>
            <TouchableOpacity style={styles.halfButton} onPress={() => navigation.navigate('Scanner')}>
              <Ionicons name="scan-outline" size={22} color="#FFF" />
              <Text style={styles.halfButtonText}>Scan Medication</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.halfButton} onPress={() => navigation.navigate('Residents')}>
              <Ionicons name="people-outline" size={22} color="#FFF" />
              <Text style={styles.halfButtonText}>Assigned Residents</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Stat Card Component
function StatCard({ icon, label, value }) {
  return (
    <View style={styles.statCard}>
      {icon}
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#EFEFEF",
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

  scrollContent: {
    paddingBottom: 24,
    paddingTop: 16,
  },

  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#7A4A2E",
    marginBottom: 4,
    marginHorizontal: 16,
  },

  subGreeting: {
    fontSize: 14,
    color: "#A75C2B",
    marginBottom: 20,
    marginHorizontal: 16,
  },

  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 16,
  },

  voiceIconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#E45C2B",
    justifyContent: "center",
    alignItems: "center",
  },

  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    marginBottom: 16,
    gap: 8,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  statLabel: {
    fontSize: 11,
    marginTop: 8,
    color: "#7A4A2E",
    textAlign: "center",
    fontWeight: "500",
  },

  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#E45C2B",
    marginTop: 4,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    elevation: 3,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  cardTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#7A4A2E",
    marginBottom: 12,
    letterSpacing: 1,
  },

  alertItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },

  alertText: {
    color: "#E45C2B",
    fontSize: 13,
    flex: 1,
  },

  scheduleItem: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "center",
  },

  scheduleTime: {
    width: 70,
    fontSize: 13,
    fontWeight: "600",
    color: "#7A4A2E",
  },

  scheduleText: {
    flex: 1,
    fontSize: 13,
    color: "#555",
  },

  scheduleMeta: {
    fontSize: 11,
    color: "#A75C2B",
    marginTop: 2,
  },

  scheduleTimeBox: {
    width: 72,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#F7E9DB",
    marginRight: 12,
  },

  scheduleContent: {
    flex: 1,
  },

  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  cardMeta: {
    fontSize: 12,
    color: "#E45C2B",
    textTransform: "uppercase",
    fontWeight: "700",
  },

  lastScanCard: {
    borderWidth: 1,
    borderColor: "#E1903A",
  },

  lastScanText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3E3A39",
    marginBottom: 4,
  },

  lastScanSub: {
    fontSize: 12,
    color: "#7A4A2E",
  },

  emptyText: {
    color: "#7A4A2E",
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 18,
  },

  linkText: {
    marginTop: 10,
    color: "#7A4A2E",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "right",
  },

  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 12,
  },

  halfButton: {
    flex: 1,
    backgroundColor: "#E1903A",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    elevation: 2,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },

  halfButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 13,
  },

  fullButton: {
    backgroundColor: "#E1903A",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    elevation: 2,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },

  fullButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
});