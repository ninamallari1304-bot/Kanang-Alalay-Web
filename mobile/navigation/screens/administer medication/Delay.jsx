import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native'
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'

const REASONS = [
  { id: 1, label: 'Resident Sleeping',           icon: <MaterialCommunityIcons name="sleep" size={18} color="#E1903A" /> },
  { id: 2, label: 'Resident temporarily refused', icon: <MaterialCommunityIcons name="account-cancel" size={18} color="#E1903A" /> },
  { id: 3, label: 'Meal not yet finish',           icon: <MaterialIcons name="no-meals" size={18} color="#E1903A" /> },
  { id: 4, label: 'Vital signs not stable',        icon: <MaterialCommunityIcons name="heart-pulse" size={18} color="#E1903A" /> },
  { id: 5, label: 'Other',                         icon: <Ionicons name="ellipsis-horizontal-circle" size={18} color="#E1903A" /> },
]

const DURATIONS = ['15 min', '30 min', '1 hour', 'Custom']

export default function Delay({ navigation }) {
  const [selectedReason, setSelectedReason] = useState(1)
  const [selectedDuration, setSelectedDuration] = useState('30 min')
  const [customDuration, setCustomDuration] = useState('')
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
        <Text style={styles.title}>Delay Medication</Text>
      </View>

      {/* Card */}
      <View style={styles.card}>

        {/* Card header */}
        <View style={styles.cardTitleRow}>
          <Ionicons name="play-circle" size={22} color="#E1903A" />
          <Text style={styles.cardTitle}>Delay Medication</Text>
        </View>
        <Text style={styles.cardSub}>Select a reason and delay duration</Text>
        <Text style={styles.cardPatient}>Lola Maria Cruz | Room 201</Text>

        {/* Reason list */}
        <View style={styles.reasonList}>
          {REASONS.map((r) => {
            const active = selectedReason === r.id
            return (
              <TouchableOpacity
                key={r.id}
                style={[styles.reasonBtn, active && styles.reasonBtnActive]}
                onPress={() => setSelectedReason(r.id)}
              >
                <View style={[styles.reasonIcon, active && styles.reasonIconActive]}>
                  {r.icon}
                </View>
                <Text style={[styles.reasonLabel, active && styles.reasonLabelActive]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Duration chips */}
        <View style={styles.durationRow}>
          {DURATIONS.map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.chip, selectedDuration === d && styles.chipActive]}
              onPress={() => setSelectedDuration(d)}
            >
              <Text style={[styles.chipText, selectedDuration === d && styles.chipTextActive]}>
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom input */}
        {selectedDuration === 'Custom' && (
          <TextInput
            style={styles.customInput}
            placeholder="Enter custom duration (e.g. 45 min)"
            placeholderTextColor="#BBB"
            value={customDuration}
            onChangeText={setCustomDuration}
          />
        )}

        {/* Confirm button */}
        <TouchableOpacity style={styles.confirmBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.confirmText}>Confirm Delay</Text>
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
              <Ionicons name="time-outline" size={32} color="#E1903A" />
            </View>

            <Text style={styles.modalTitle}>Delay Medication</Text>
            <Text style={styles.modalMessage}>
              Resident's medication intake is about to be delayed. Please confirm to proceed.
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

  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },

  cardSub: {
    fontSize: 13,
    color: '#888',
    marginBottom: 2,
  },

  cardPatient: {
    fontSize: 12,
    color: '#AAAAAA',
    marginBottom: 16,
  },

  reasonList: {
    gap: 10,
    marginBottom: 16,
  },

  reasonBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FEF3E2',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },

  reasonBtnActive: {
    backgroundColor: '#E1903A',
    borderColor: '#C97020',
  },

  reasonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  reasonIconActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },

  reasonLabel: {
    fontSize: 14,
    color: '#8B5E3C',
    fontWeight: '500',
  },

  reasonLabelActive: {
    color: '#FFF',
    fontWeight: '700',
  },

  durationRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F0E8D8',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },

  chipActive: {
    backgroundColor: '#FEF3E2',
    borderColor: '#E1903A',
  },

  chipText: {
    fontSize: 13,
    color: '#8B5E3C',
    fontWeight: '500',
  },

  chipTextActive: {
    color: '#E1903A',
    fontWeight: '700',
  },

  customInput: {
    borderWidth: 1.5,
    borderColor: '#E1903A',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    marginBottom: 16,
  },

  confirmBtn: {
    backgroundColor: '#E1903A',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },

  confirmText: {
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