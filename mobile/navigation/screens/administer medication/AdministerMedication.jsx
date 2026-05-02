import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Animated,
  TextInput,
  Alert,
} from 'react-native'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import * as Speech from 'expo-speech-recognition'

export default function AdministerMedication({ navigation, route }) {
  const { resident, medication } = route.params;
  const [modalVisible, setModalVisible] = useState(false)
  // 'confirm' | 'loading' | 'success'
  const [modalState, setModalState] = useState('confirm')
  const spinAnim = useRef(new Animated.Value(0)).current
  const progressAnim = useRef(new Animated.Value(0)).current
  const checkScale = useRef(new Animated.Value(0)).current

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false)
  const [voiceNote, setVoiceNote] = useState('')
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [isListening, setIsListening] = useState(false)

  useEffect(() => {
    if (modalState === 'loading') {
      spinAnim.setValue(0)
      progressAnim.setValue(0)

      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        })
      ).start()

      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          spinAnim.stopAnimation()
          setModalState('success')
        }
      })
    }

    if (modalState === 'success') {
      checkScale.setValue(0)
      Animated.spring(checkScale, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }).start()
    }

    if (modalState === 'confirm') {
      spinAnim.stopAnimation()
      spinAnim.setValue(0)
      progressAnim.setValue(0)
      checkScale.setValue(0)
    }
  }, [modalState])

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] })
  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })

  const handleOpenModal = () => {
    setModalState('confirm')
    setModalVisible(true)
  }

  const handleConfirm = () => setModalState('loading')

  const handleCancel = () => {
    setModalState('confirm')
    setModalVisible(false)
  }

  const handleFinish = () => {
    setModalVisible(false)
    setModalState('confirm')
    navigation.reset({ index: 0, routes: [{ name: 'AllRes' }] })
  }

  // Voice recording functions
  const startRecording = async () => {
    try {
      const { granted } = await Speech.requestPermissionsAsync()
      if (!granted) {
        Alert.alert('Permission Required', 'Microphone permission is required for voice recording.')
        return
      }

      setIsRecording(true)
      setIsListening(true)
      setVoiceNote('')

      await Speech.startAsync({
        language: 'en-US',
        onResult: (result) => {
          if (result.isFinal) {
            setVoiceNote(prev => prev + result.transcript + ' ')
          }
        },
        onError: (error) => {
          console.error('Speech recognition error:', error)
          setIsRecording(false)
          setIsListening(false)
          Alert.alert('Error', 'Speech recognition failed. Please try again.')
        }
      })
    } catch (error) {
      console.error('Error starting recording:', error)
      Alert.alert('Error', 'Failed to start voice recording.')
    }
  }

  const stopRecording = async () => {
    try {
      await Speech.stopAsync()
      setIsRecording(false)
      setIsListening(false)
    } catch (error) {
      console.error('Error stopping recording:', error)
    }
  }

  const saveVoiceNote = () => {
    if (voiceNote.trim()) {
      Alert.alert('Voice Note Saved', 'Your voice note has been recorded and saved.')
      setShowVoiceModal(false)
      setVoiceNote('')
    } else {
      Alert.alert('No Content', 'Please record a voice note first.')
    }
  }

  const clearVoiceNote = () => {
    setVoiceNote('')
  }

  return (
    <View style={styles.container}>

      {/* Header */}
          <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.reset({ index: 0, routes: [{ name: 'AllRes' }] })}>
              <Ionicons name="arrow-back" size={26} color="#E45C2B" />
              </TouchableOpacity>
      
              <Text style={styles.title}>Administer Medication</Text>
          </View>

      {/* <Text style={styles.subHeader}>Lola Maria, inumin na po ang gamot</Text> */}

      {/* Patient Card */}
      <View style={styles.card}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={28} color="#fff" />
          </View>
          <View>
            <Text style={styles.name}>Lola Maria Cruz</Text>
            <Text style={styles.room}>Room 201</Text>
          </View>
        </View>

        {/* Medication Box */}
        <View style={styles.medBox}>
          <Text style={styles.medTitle}>{medication ? medication.name : 'Paracetamol 500mg'}</Text>
          <Text style={styles.medSub}>Oral | After Meal</Text>
          <TouchableOpacity style={styles.giveBtn} onPress={handleOpenModal}>
            <Text style={styles.giveText}>GIVE MEDICATION</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.smallBtn}>
            <MaterialIcons name="schedule" size={22} color="#8B5E3C" onPress={() => navigation.navigate("Delay")}/>
            <Text style={styles.smallLabel}>Delay</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallBtn}>
            <Ionicons name="person-remove" size={22} color="#8B5E3C" onPress={() => navigation.navigate("Refuse")}/>
            <Text style={styles.smallLabel}>Refuse</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallBtn}>
            <MaterialIcons name="report" size={22} color="#8B5E3C" onPress={() => navigation.navigate("SideEffect")}/>
            <Text style={styles.smallLabel}>Side Effect</Text>
          </TouchableOpacity>
        </View>

        {/* Voice Note */}
        <TouchableOpacity
          style={[styles.voiceBtn, isRecording && styles.voiceBtnRecording]}
          onPress={() => setShowVoiceModal(true)}
        >
          <Ionicons name={isRecording ? "mic" : "mic-outline"} size={24} color={isRecording ? "#E45C2B" : "#8B5E3C"} />
          <Text style={[styles.voiceText, isRecording && styles.voiceTextRecording]}>
            {isRecording ? 'Recording...' : 'Record Voice Note'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={modalState === 'confirm' ? handleCancel : undefined}
      >
        <Pressable
          style={styles.overlay}
          onPress={modalState === 'confirm' ? handleCancel : undefined}
        >
          <Pressable style={styles.modal} onPress={() => {}}>

            {/* ── Confirm State ── */}
            {modalState === 'confirm' && (
              <>
                <View style={styles.modalHeader}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  <Text style={styles.modalHeaderText}>Confirm Medication Administration</Text>
                </View>

                <View style={styles.modalMedBox}>
                  <Text style={styles.modalMedTitle}>{medication ? medication.name : 'Paracetamol 500mg'}</Text>
                  <Text style={styles.modalMedSub}>Oral | After Meal</Text>
                  <View style={styles.modalPatientRow}>
                    <Ionicons name="person-outline" size={14} color="#888" />
                    <Text style={styles.modalPatientText}>Lola Maria | Room 201</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
                  <Text style={styles.confirmText}>Confirm & Give</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}

            {/* ── Loading State ── */}
            {modalState === 'loading' && (
              <>
                <Text style={styles.administeringText}>Administering...</Text>

                <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
                  {[...Array(8)].map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.spinnerDot,
                        {
                          opacity: (i + 1) / 8,
                          transform: [
                            { rotate: `${i * 45}deg` },
                            { translateY: -14 },
                          ],
                        },
                      ]}
                    />
                  ))}
                </Animated.View>

                <View style={styles.progressTrack}>
                  <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
                </View>

                <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}

            {/* ── Success State ── */}
            {modalState === 'success' && (
              <>
                <Animated.View style={[styles.successCircle, { transform: [{ scale: checkScale }] }]}>
                  <Ionicons name="checkmark" size={46} color="#4CAF50" />
                </Animated.View>

                <Text style={styles.successText}>
                  You have successfully administered Paracetamol to Lola Maria Cruz. This Action has added to your daily report
                </Text>

                <TouchableOpacity style={styles.finishBtn} onPress={handleFinish}>
                  <Text style={styles.finishText}>Finish & Close</Text>
                </TouchableOpacity>
              </>
            )}

          </Pressable>
        </Pressable>
      </Modal>

      {/* Voice Recording Modal */}
      <Modal
        transparent
        visible={showVoiceModal}
        animationType="slide"
        onRequestClose={() => {
          if (isRecording) stopRecording()
          setShowVoiceModal(false)
        }}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => {
            if (isRecording) stopRecording()
            setShowVoiceModal(false)
          }}
        >
          <Pressable style={styles.voiceModal} onPress={() => {}}>
            <View style={styles.voiceModalHeader}>
              <Text style={styles.voiceModalTitle}>Voice Note</Text>
              <TouchableOpacity
                onPress={() => {
                  if (isRecording) stopRecording()
                  setShowVoiceModal(false)
                }}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.voiceRecordingArea}>
              <TouchableOpacity
                style={[styles.recordBtn, isRecording && styles.recordBtnActive]}
                onPress={isRecording ? stopRecording : startRecording}
              >
                <Ionicons
                  name={isRecording ? "stop" : "mic"}
                  size={32}
                  color={isRecording ? "#fff" : "#E45C2B"}
                />
              </TouchableOpacity>

              <Text style={styles.recordingStatus}>
                {isRecording ? 'Listening... Tap to stop' : 'Tap to start recording'}
              </Text>

              {isListening && (
                <View style={styles.listeningIndicator}>
                  <Text style={styles.listeningText}>🎤 Listening...</Text>
                </View>
              )}
            </View>

            <View style={styles.voiceTextArea}>
              <TextInput
                style={styles.voiceInput}
                multiline
                placeholder="Your voice note will appear here..."
                value={voiceNote}
                onChangeText={setVoiceNote}
                editable={!isRecording}
              />
            </View>

            <View style={styles.voiceModalActions}>
              <TouchableOpacity
                style={styles.voiceCancelBtn}
                onPress={clearVoiceNote}
                disabled={isRecording}
              >
                <Text style={[styles.voiceCancelText, isRecording && styles.disabledText]}>Clear</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.voiceSaveBtn, (!voiceNote.trim() || isRecording) && styles.disabledBtn]}
                onPress={saveVoiceNote}
                disabled={!voiceNote.trim() || isRecording}
              >
                <Text style={[styles.voiceSaveText, (!voiceNote.trim() || isRecording) && styles.disabledText]}>
                  Save Note
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
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

  subHeader: {
    marginTop: 6,
    color: '#8B5E3C',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    marginLeft: 16,
    marginRight: 16,
    elevation: 4,
  },

  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#D88A3D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },

  room: {
    color: '#777',
  },

  medBox: {
    backgroundColor: '#F3F3F3',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },

  medTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B5E3C',
  },

  medSub: {
    color: '#777',
    marginBottom: 12,
  },

  giveBtn: {
    backgroundColor: '#D88A3D',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  giveText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  smallBtn: {
    backgroundColor: '#EFE4C8',
    width: 90,
    height: 70,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  smallLabel: {
    fontSize: 12,
    marginTop: 4,
    color: '#8B5E3C',
  },

  voiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFE4C8',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },

  voiceBtnRecording: {
    backgroundColor: '#FFE6E6',
    borderColor: '#E45C2B',
    borderWidth: 1,
  },

  voiceTextRecording: {
    color: '#E45C2B',
  },

  // Voice Modal Styles
  voiceModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },

  voiceModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  voiceModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7A4A2E',
  },

  voiceRecordingArea: {
    alignItems: 'center',
    marginBottom: 20,
  },

  recordBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E45C2B',
  },

  recordBtnActive: {
    backgroundColor: '#E45C2B',
    shadowColor: '#E45C2B',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  recordingStatus: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },

  listeningIndicator: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#E8F5E8',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },

  listeningText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  voiceTextArea: {
    marginBottom: 20,
  },

  voiceInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    maxHeight: 200,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fafafa',
  },

  voiceModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  voiceCancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    marginRight: 8,
  },

  voiceCancelText: {
    color: '#666',
    fontWeight: '600',
  },

  voiceSaveBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#E45C2B',
    alignItems: 'center',
    marginLeft: 8,
  },

  voiceSaveText: {
    color: '#fff',
    fontWeight: '600',
  },

  disabledBtn: {
    backgroundColor: '#ccc',
  },

  disabledText: {
    color: '#999',
  },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  modal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },

  // Loading state
  administeringText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },

  spinner: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  spinnerDot: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E1903A',
  },

  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginBottom: 20,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },

  // Success state
  successCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  successText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },

  finishBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },

  finishText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },

  // Confirm state
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },

  modalHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4CAF50',
    flexShrink: 1,
  },

  modalMedBox: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    width: '100%',
  },

  modalMedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },

  modalMedSub: {
    color: '#777',
    fontSize: 13,
    marginBottom: 10,
  },

  modalPatientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  modalPatientText: {
    fontSize: 13,
    color: '#888',
  },

  confirmBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },

  confirmText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },

  cancelBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    width: '100%',
  },

  cancelText: {
    color: '#555',
    fontSize: 14,
    fontWeight: '500',
  },
})