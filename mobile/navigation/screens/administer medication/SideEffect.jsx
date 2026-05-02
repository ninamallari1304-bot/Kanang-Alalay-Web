import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const SYMPTOMS = [
  { id: 'nausea',    label: 'Nausea' },
  { id: 'dizziness', label: 'Dizziness' },
  { id: 'vital',     label: 'Vital sign abnormal' },
  { id: 'other',     label: 'Other' },
]

const SEVERITY_LEVELS = ['Mild', 'Moderate', 'Severe']

export default function SideEffect({ navigation }) {
  const [symptoms, setSymptoms] = useState({ nausea: true, dizziness: false, vital: false, other: false })
  const [severity, setSeverity] = useState('Mild')
  const [doctorNotified, setDoctorNotified] = useState(false)
  const [emergencyProtocol, setEmergencyProtocol] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)

  const toggleSymptom = (id) => setSymptoms(prev => ({ ...prev, [id]: !prev[id] }))

  const severityColor = severity === 'Mild' ? '#4CAF50' : severity === 'Moderate' ? '#E1903A' : '#D32F2F'
  const sliderPos = severity === 'Mild' ? 0 : severity === 'Moderate' ? 50 : 100

  const handleConfirm = () => {
    setModalVisible(false)
    navigation?.reset({ index: 0, routes: [{ name: 'AllRes' }] })
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#8B5E3C" />
        </TouchableOpacity>
        <Text style={styles.title}>Side Effects/Incident Report</Text>
      </View>

      {/* Patient card */}
      <View style={styles.patientCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={26} color="#FFF" />
        </View>
        <View>
          <Text style={styles.patientName}>Lola Maria Cruz</Text>
          <Text style={styles.patientRoom}>Room 201</Text>
        </View>
      </View>

      {/* Main card */}
      <View style={styles.card}>

        {/* Symptoms */}
        <Text style={styles.sectionTitle}>Symptoms</Text>
        <View style={styles.symptomsGrid}>
          {SYMPTOMS.map((s) => {
            const checked = symptoms[s.id]
            return (
              <TouchableOpacity
                key={s.id}
                style={[styles.symptomChip, checked && styles.symptomChipChecked]}
                onPress={() => toggleSymptom(s.id)}
              >
                <View style={[styles.miniCheck, checked && styles.miniCheckChecked]}>
                  {checked && <Ionicons name="checkmark" size={11} color="#FFF" />}
                </View>
                <Text style={[styles.symptomLabel, checked && styles.symptomLabelChecked]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Action Taken / Severity */}
        <Text style={styles.sectionTitle}>Action Taken</Text>
        <View style={styles.severityCard}>

          {/* Severity toggle pills */}
          <View style={styles.severityPills}>
            <View style={styles.mildRow}>
              <View style={[styles.miniCheck, styles.miniCheckChecked]}>
                <Ionicons name="checkmark" size={11} color="#FFF" />
              </View>
              <Text style={styles.mildLabel}>Mild</Text>
            </View>
            <View style={styles.pillsRight}>
              {['Moderate', 'Severe'].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.pill,
                    severity === s && { backgroundColor: s === 'Severe' ? '#D32F2F' : '#E1903A' }
                  ]}
                  onPress={() => setSeverity(s)}
                >
                  <Text style={[styles.pillText, severity === s && styles.pillTextActive]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Slider track */}
          <View style={styles.sliderTrack}>
            <View style={[styles.sliderFill, {
              width: `${sliderPos}%`,
              backgroundColor: severityColor,
            }]} />
            <View style={[styles.sliderThumb, {
              left: `${sliderPos}%`,
              backgroundColor: severityColor,
            }]} />
          </View>

          {/* Slider labels */}
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>Mild</Text>
            <Text style={styles.sliderLabel}>Moderate</Text>
            <Text style={styles.sliderLabel}>Severe</Text>
          </View>

          {/* Tap severity buttons below slider */}
          <View style={styles.sliderTaps}>
            {SEVERITY_LEVELS.map((s) => (
              <TouchableOpacity
                key={s}
                style={styles.sliderTapArea}
                onPress={() => setSeverity(s)}
              />
            ))}
          </View>
        </View>

        {/* Checkboxes */}
        <TouchableOpacity style={styles.checkRow} onPress={() => setDoctorNotified(v => !v)}>
          <View style={[styles.checkbox, doctorNotified && styles.checkboxChecked]}>
            {doctorNotified && <Ionicons name="checkmark" size={13} color="#FFF" />}
          </View>
          <Text style={styles.checkLabel}>Doctor notified</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.checkRow} onPress={() => setEmergencyProtocol(v => !v)}>
          <View style={[styles.checkbox, emergencyProtocol && styles.checkboxChecked]}>
            {emergencyProtocol && <Ionicons name="checkmark" size={13} color="#FFF" />}
          </View>
          <Text style={styles.checkLabel}>Emergency Protocol</Text>
        </TouchableOpacity>

        {/* Submit */}
        <TouchableOpacity style={styles.submitBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.submitText}>Submit Report</Text>
        </TouchableOpacity>

      </View>

      {/* Confirmation Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>

            <View style={styles.modalIconWrapper}>
              <Ionicons name="warning-outline" size={32} color="#E1903A" />
            </View>

            <Text style={styles.modalTitle}>Submit Report</Text>
            <Text style={styles.modalMessage}>
              Side effects have been logged for Resident. Please confirm to proceed.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmModalBtn}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmModalText}>Confirm</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </View>
  )
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

  patientCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
    elevation: 3,
    marginHorizontal: 16,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E1903A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },

  patientRoom: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 18,
    elevation: 4,
    marginHorizontal: 16,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    marginTop: 4,
  },

  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },

  symptomChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },

  symptomChipChecked: {
    backgroundColor: '#FEF3E2',
    borderColor: '#E1903A',
  },

  miniCheck: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  miniCheckChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },

  symptomLabel: {
    fontSize: 13,
    color: '#555',
  },

  symptomLabelChecked: {
    color: '#E1903A',
    fontWeight: '600',
  },

  severityCard: {
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },

  severityPills: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  mildRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  mildLabel: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },

  pillsRight: {
    flexDirection: 'row',
    gap: 6,
  },

  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#EEE',
  },

  pillText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },

  pillTextActive: {
    color: '#FFF',
  },

  sliderTrack: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginBottom: 6,
    position: 'relative',
    justifyContent: 'center',
  },

  sliderFill: {
    height: '100%',
    borderRadius: 3,
    position: 'absolute',
    left: 0,
  },

  sliderThumb: {
    width: 14,
    height: 14,
    borderRadius: 7,
    position: 'absolute',
    marginLeft: -7,
    top: -4,
    borderWidth: 2,
    borderColor: '#FFF',
    elevation: 3,
  },

  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  sliderLabel: {
    fontSize: 11,
    color: '#AAA',
  },

  sliderTaps: {
    flexDirection: 'row',
    position: 'absolute',
    left: 14,
    right: 14,
    top: 40,
    height: 30,
  },

  sliderTapArea: {
    flex: 1,
  },

  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkboxChecked: {
    backgroundColor: '#E1903A',
    borderColor: '#E1903A',
  },

  checkLabel: {
    fontSize: 14,
    color: '#555',
  },

  submitBtn: {
    backgroundColor: '#E1903A',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },

  submitText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    width: '80%',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },

  modalIconWrapper: {
    backgroundColor: '#FEF3E2',
    borderRadius: 50,
    padding: 12,
    marginBottom: 14,
  },

  modalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#7A4A2E',
    marginBottom: 8,
  },

  modalMessage: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },

  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },

  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD',
    alignItems: 'center',
  },

  cancelText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '600',
  },

  confirmModalBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#E1903A',
    alignItems: 'center',
  },

  confirmModalText: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: '600',
  },
})