import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const REASONS = [
  { id: 1, label: 'Resident declined' },
  { id: 2, label: 'Difficulty swallowing' },
  { id: 3, label: 'Nausea' },
  { id: 4, label: 'Confusion' },
]

export default function Refuse({ navigation }) {
  const [selectedReason, setSelectedReason] = useState(1)
  const [otherReason, setOtherReason] = useState('')
  const [notes, setNotes] = useState('')
  const [doctorNotified, setDoctorNotified] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)

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
        <Text style={styles.title}>Medication Refused</Text>
      </View>

      <Text style={styles.patientLabel}>Lola Maria Cruz | Room 201</Text>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Reason for refusal</Text>
        <View style={styles.divider} />

        {/* Radio reasons */}
        <View style={styles.reasonList}>
          {REASONS.map((r) => {
            const active = selectedReason === r.id
            return (
              <TouchableOpacity
                key={r.id}
                style={[styles.radioRow, active && styles.radioRowActive]}
                onPress={() => setSelectedReason(r.id)}
              >
                <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
                  {active && <View style={styles.radioInner} />}
                </View>
                <Text style={[styles.radioLabel, active && styles.radioLabelActive]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Other input */}
        <TextInput
          style={styles.otherInput}
          placeholder="Other (Please specify reason)"
          placeholderTextColor="#BBB"
          value={otherReason}
          onChangeText={(t) => { setOtherReason(t); setSelectedReason(null) }}
        />

        {/* Notes input */}
        <View style={styles.notesRow}>
          <Ionicons name="mic-outline" size={18} color="#8B5E3C" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.notesInput}
            placeholder="Add Notes (optional)"
            placeholderTextColor="#BBB"
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        {/* Doctor notified checkbox */}
        <TouchableOpacity
          style={styles.checkRow}
          onPress={() => setDoctorNotified(v => !v)}
        >
          <View style={[styles.checkbox, doctorNotified && styles.checkboxChecked]}>
            {doctorNotified && <Ionicons name="checkmark" size={13} color="#FFF" />}
          </View>
          <Text style={styles.checkLabel}>Doctor notified</Text>
        </TouchableOpacity>

        {/* Confirm button */}
        <TouchableOpacity style={styles.confirmBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.confirmText}>Confirm Refusal</Text>
        </TouchableOpacity>

        {/* Cancel button */}
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation?.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
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
              <Ionicons name="close-circle-outline" size={32} color="#E1903A" />
            </View>

            <Text style={styles.modalTitle}>Confirm Refusal</Text>
            <Text style={styles.modalMessage}>
              Resident's medication intake has been refused. Please confirm to proceed.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleConfirm}
              >
                <Text style={styles.modalConfirmText}>Confirm</Text>
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

  patientLabel: {
    fontSize: 13,
    color: '#AAAAAA',
    marginBottom: 16,
    marginLeft: 2,
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    marginLeft: 16,
    marginRight: 16,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8B5E3C',
    marginBottom: 10,
  },

  divider: {
    height: 1,
    backgroundColor: '#F0E8D8',
    marginBottom: 14,
  },

  reasonList: {
    gap: 10,
    marginBottom: 14,
  },

  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },

  radioRowActive: {
    backgroundColor: '#FEF3E2',
  },

  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  radioOuterActive: {
    borderColor: '#E1903A',
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E1903A',
  },

  radioLabel: {
    fontSize: 14,
    color: '#555',
  },

  radioLabelActive: {
    color: '#E1903A',
    fontWeight: '600',
  },

  otherInput: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },

  notesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },

  notesInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },

  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
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

  confirmBtn: {
    backgroundColor: '#E1903A',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },

  confirmText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
  },

  cancelBtn: {
    borderWidth: 1.5,
    borderColor: '#DDD',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },

  cancelText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
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

  modalCancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD',
    alignItems: 'center',
  },

  modalCancelText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '600',
  },

  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#E1903A',
    alignItems: 'center',
  },

  modalConfirmText: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: '600',
  },
})