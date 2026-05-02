import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons'
import { getResidentById, getResidentMedications, getMedicationHistory } from '../../services/api'

const TABS = ['Overview', 'Medications', 'History']

export default function ResidentOverview({ navigation, route }) {
  const [activeTab, setActiveTab] = useState('Overview')
  const [resident, setResident] = useState(null)
  const [currentMeds, setCurrentMeds] = useState([])
  const [medHistory, setMedHistory] = useState([])
  const [loading, setLoading] = useState(true)

  const residentParam = route?.params?.resident

  useEffect(() => {
    if (residentParam) {
      loadResidentData()
    } else {
      Alert.alert('Error', 'No resident data provided')
      navigation.goBack()
    }
  }, [residentParam])

  const loadResidentData = async () => {
    setLoading(true)
    try {
      const residentId = residentParam._id || residentParam.id

      // Load resident details
      const residentResponse = await getResidentById(residentId)
      setResident(residentResponse.data)

      // Load current medications
      const medsResponse = await getResidentMedications(residentId)
      const medsData = medsResponse.data || []
      setCurrentMeds(medsData.map(med => ({
        id: med._id,
        name: med.name?.toUpperCase() || 'UNKNOWN MEDICATION',
        dose: med.dosage || 'As prescribed',
        frequency: med.frequency || 'Daily',
        status: med.status === 'active' ? 'Active' : 'Inactive',
        statusColor: med.status === 'active' ? '#4CAF50' : '#666',
        ...med
      })))

      // Load medication history
      const historyResponse = await getMedicationHistory(residentId)
      const historyData = historyResponse.data || []
      setMedHistory(historyData.map(item => ({
        id: item._id,
        date: new Date(item.administeredAt || item.createdAt).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        }),
        verified: item.verified || true,
        nurse: item.administeredBy?.name || item.nurse || 'Unknown',
        name: item.medication?.name?.toUpperCase() || 'UNKNOWN MEDICATION',
        dose: item.dosage || null,
        frequency: item.frequency || null,
        ...item
      })))

    } catch (error) {
      console.error('Error loading resident data:', error)
      Alert.alert('Error', 'Failed to load resident information')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E1903A" />
        <Text style={styles.loadingText}>Loading resident information...</Text>
      </View>
    )
  }

  if (!resident) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Ionicons name="arrow-back" size={26} color="#E45C2B" />
          </TouchableOpacity>
          <Text style={styles.title}>Resident Profile</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load resident information</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadResidentData}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#E45C2B" />
        </TouchableOpacity>
        <Text style={styles.title}>Resident Profile</Text>
      </View>

      {/* Patient row */}
      <View style={styles.patientRow}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={26} color="#AAA" />
        </View>
        <View>
          <Text style={styles.patientName}>
            {resident.firstName} {resident.lastName}
          </Text>
          <Text style={styles.patientMeta}>
            Age: {resident.age || 'N/A'}  ·  Room {resident.roomNumber || 'N/A'}
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'Overview' && (
          <>
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>Vital Signs</Text>
                <Text style={styles.cardMeta}>Latest: {resident.lastVitalCheck || 'N/A'}</Text>
              </View>
              <View style={styles.vitalList}>
                <VitalRow
                  icon={<MaterialCommunityIcons name="heart-pulse" size={26} color="#222" />}
                  label={`Pulse: ${resident.vitals?.pulse || 'N/A'} bpm`}
                />
                <VitalRow
                  icon={<MaterialCommunityIcons name="water" size={26} color="#222" />}
                  label={`Blood Sugar: ${resident.vitals?.bloodSugar || 'N/A'} mg/dL`}
                />
                <VitalRow
                  icon={<FontAwesome5 name="lungs" size={22} color="#222" />}
                  label={`Respiration: ${resident.vitals?.respiration || 'N/A'} breaths`}
                />
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.allergiesText}>
                <Text style={styles.allergiesLabel}>Allergies:  </Text>
                {resident.allergies?.join(', ') || 'None reported'}
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Emergency Contact</Text>
              <View style={styles.contactBox}>
                <Text style={styles.contactName}>
                  {resident.emergencyContact?.name || 'Not provided'}
                </Text>
                <Text style={styles.contactNumber}>
                  {resident.emergencyContact?.phone || 'Not provided'}
                </Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Care Notes</Text>
              <View style={styles.notesList}>
                {resident.careNotes?.length > 0 ? (
                  resident.careNotes.slice(0, 2).map((note, index) => (
                    <Text key={index} style={styles.noteItem}>• {note}</Text>
                  ))
                ) : (
                  <Text style={styles.noteItem}>• No care notes available</Text>
                )}
              </View>
              {resident.careNotes?.length > 2 && (
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See All Notes</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}

        {/* ── MEDICATIONS TAB ── */}
        {activeTab === 'Medications' && (
          <>
            <TouchableOpacity style={styles.addMedBtn}>
              <Ionicons name="add-circle" size={20} color="#FFF" />
              <Text style={styles.addMedText}>Add Medication</Text>
            </TouchableOpacity>

            <Text style={styles.sectionLabel}>Current Medication</Text>
            <View style={styles.card}>
              {currentMeds.length > 0 ? (
                currentMeds.map((med, index) => (
                  <View key={med.id}>
                    <View style={styles.medRow}>
                      <View style={styles.medImageBox}>
                        <MaterialCommunityIcons name="pill" size={28} color="#E1903A" />
                      </View>
                      <View style={styles.medInfo}>
                        <Text style={styles.medName}>{med.name}</Text>
                        <Text style={styles.medDose}>{med.dose}</Text>
                        <View style={styles.medFreqRow}>
                          <Ionicons name="time-outline" size={13} color="#AAA" />
                          <Text style={styles.medFreq}>{med.frequency}</Text>
                        </View>
                      </View>
                      <Text style={[styles.medStatus, { color: med.statusColor }]}>
                        {med.status}
                      </Text>
                    </View>
                    {index < currentMeds.length - 1 && <View style={styles.divider} />}
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No current medications</Text>
              )}
            </View>

            <Text style={styles.sectionLabel}>Administration History</Text>
            <View style={styles.card}>
              {medHistory.length > 0 ? (
                medHistory.slice(0, 5).map((h, index) => (
                  <View key={h.id}>
                    <View style={styles.historyDateRow}>
                      <Text style={styles.historyDate}>{h.date}</Text>
                      {h.verified && (
                        <View style={styles.verifiedBadge}>
                          <Text style={styles.verifiedText}>Verified</Text>
                        </View>
                      )}
                      <Text style={styles.historyNurse}>{h.nurse}</Text>
                    </View>
                    <View style={styles.medRow}>
                      <View style={styles.medImageBox}>
                        <MaterialCommunityIcons name="pill" size={28} color="#E1903A" />
                      </View>
                      <View style={styles.medInfo}>
                        <Text style={styles.medName}>{h.name}</Text>
                        {h.dose && <Text style={styles.medDose}>{h.dose}</Text>}
                        {h.frequency && (
                          <View style={styles.medFreqRow}>
                            <Ionicons name="time-outline" size={13} color="#AAA" />
                            <Text style={styles.medFreq}>{h.frequency}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    {index < Math.min(medHistory.length, 5) - 1 && <View style={styles.divider} />}
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No medication history available</Text>
              )}
            </View>
          </>
        )}

        {/* ── HISTORY TAB ── */}
        {activeTab === 'History' && (
          <View style={styles.historyContainer}>
            <Text style={styles.historyPlaceholder}>
              Detailed history timeline will be implemented with backend integration
            </Text>
          </View>
        )}

      </ScrollView>
    </View>
  )
}

function TimelineIndicator({ status }) {
  if (status === 'done') {
    return (
      <View style={styles.indicatorDone}>
        <Ionicons name="checkmark" size={13} color="#FFF" />
      </View>
    )
  }
  if (status === 'missed') {
    return (
      <View style={styles.indicatorMissed}>
        <Ionicons name="warning-outline" size={14} color="#E1903A" />
      </View>
    )
  }
  // info / vitals: grey square
  return <View style={styles.indicatorInfo} />
}

function VitalRow({ icon, label }) {
  return (
    <View style={styles.vitalRow}>
      <View style={styles.vitalIcon}>{icon}</View>
      <Text style={styles.vitalLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EFEFEF",
    paddingTop: 50,
    paddingHorizontal: 16,
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

  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },

  patientMeta: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },

  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#EFE4C8',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },

  tab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 9,
    alignItems: 'center',
  },

  tabActive: {
    backgroundColor: '#E1903A',
  },

  tabText: {
    fontSize: 13,
    color: '#8B5E3C',
    fontWeight: '600',
  },

  tabTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },

  scrollContent: {
    paddingBottom: 30,
    gap: 12,
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },

  cardMeta: {
    fontSize: 12,
    color: '#AAA',
  },

  vitalList: { gap: 12 },

  vitalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  vitalIcon: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },

  vitalLabel: { fontSize: 14, color: '#333' },

  allergiesLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E1903A',
  },

  allergiesText: { fontSize: 14, color: '#333' },

  contactBox: {
    backgroundColor: '#FEF3E2',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  contactName: { fontSize: 14, fontWeight: '600', color: '#333' },
  contactNumber: { fontSize: 13, color: '#888' },

  notesList: { gap: 6, marginBottom: 14 },

  noteItem: { fontSize: 13, color: '#555', lineHeight: 20 },

  seeAllText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },

  addMedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E1903A',
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 22,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },

  addMedText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },

  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    marginTop: 4,
  },

  medRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },

  medImageBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#FEF3E2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  medInfo: { flex: 1 },

  medName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#222',
    marginBottom: 2,
  },

  medDose: { fontSize: 12, color: '#888', marginBottom: 3 },

  medFreqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  medFreq: { fontSize: 12, color: '#AAA' },

  medStatus: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
    flexShrink: 0,
    maxWidth: 70,
  },

  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 2,
  },

  historyDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 2,
  },

  historyDate: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },

  verifiedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },

  verifiedText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '700',
  },

  historyNurse: {
    fontSize: 12,
    color: '#888',
  },

  // ── History Tab Timeline ──
  groupLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    marginTop: 4,
  },

  timelineCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  timelineRow: {
    flexDirection: 'row',
    gap: 12,
  },

  timelineLeft: {
    alignItems: 'center',
    width: 24,
  },

  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#EEE',
    marginTop: 4,
    marginBottom: 0,
    minHeight: 20,
  },

  indicatorDone: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },

  indicatorMissed: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEF3E2',
    borderWidth: 1.5,
    borderColor: '#E1903A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  indicatorInfo: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: '#CCC',
    marginTop: 5,
  },

  timelineContent: {
    flex: 1,
    paddingBottom: 4,
  },

  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },

  timelineTime: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },

  timelineNurse: {
    fontSize: 12,
    color: '#888',
  },

  timelineMedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  medDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },

  medDetailText: {
    fontSize: 12,
    color: '#E1903A',
  },

  missedText: {
    fontSize: 12,
    color: '#E1903A',
    fontWeight: '600',
  },

  vitalsBox: {
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    padding: 10,
  },

  vitalsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },

  vitalsGrid: {
    gap: 4,
  },

  vitalItem: {},

  vitalItemText: {
    fontSize: 13,
    color: '#555',
  },

  vitalItemValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },

  noteBox: {
    gap: 4,
  },

  timelineNote: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
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

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  errorText: {
    fontSize: 16,
    color: "#7A4A2E",
    textAlign: "center",
    marginBottom: 20,
  },

  retryButton: {
    backgroundColor: "#E1903A",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },

  retryText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
})