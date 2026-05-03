import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Switch,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Speech from 'expo-speech'
import {
  AudioModule,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  RecordingPresets,
} from 'expo-audio'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_URL } from '../../config'
import { useAuth } from '../../contexts/AuthContext'

export default function VoiceAssistant({ navigation }) {
  const { user } = useAuth()
  const [recording, setRecording] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [thinking, setThinking] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(true)
  const [transcript, setTranscript] = useState('')
  const [speechError, setSpeechError] = useState('')
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: `Hello! I'm your medication assistant for the Kanang-Alalay system. As a ${user?.role?.replace('_', ' ') || 'caregiver'}, you can ask me questions about medications, administration guidelines, or system features.`,
      timestamp: new Date(),
    }
  ])
  const [inputText, setInputText] = useState('')
  const scrollViewRef = useRef()

  useEffect(() => {
    if (user?.role) {
      loadConversationHistory()
    }
  }, [user?.role])

  const loadConversationHistory = async () => {
    try {
      const key = `voice_assistant_${user.role}`
      const stored = await AsyncStorage.getItem(key)
      if (stored) {
        const history = JSON.parse(stored)
        setMessages(history)
      }
    } catch (error) {
      console.error('Load conversation history error:', error)
    }
  }

  const saveConversationHistory = async (newMessages) => {
    try {
      if (user?.role) {
        const key = `voice_assistant_${user.role}`
        await AsyncStorage.setItem(key, JSON.stringify(newMessages))
      }
    } catch (error) {
      console.error('Save conversation history error:', error)
    }
  }

  const startRecording = async () => {
    try {
      const permission = await requestRecordingPermissionsAsync()
      if (!permission.granted) {
        Alert.alert(
          'Permission required',
          'Microphone access is required to record your voice.'
        )
        return
      }

      await setAudioModeAsync({
        allowsRecordingIOS: true,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
      })

      const recorder = new AudioModule.AudioRecorder()
      await recorder.prepareToRecordAsync(RecordingPresets.HIGH_QUALITY)
      recorder.record()

      setRecording(recorder)
      setIsRecording(true)
      setSpeechError('')
    } catch (error) {
      console.error('Recording start error:', error)
      setSpeechError('Unable to start recording. Please try again.')
      Alert.alert('Recording error', 'Unable to start recording. Please try again.')
    }
  }

  const stopRecording = async () => {
    if (!recording) return

    try {
      await recording.stop()
      const uri = recording.uri
      setRecording(null)
      setIsRecording(false)
      if (uri) {
        await transcribeAudio(uri)
      }
    } catch (error) {
      console.error('Recording stop error:', error)
      setSpeechError('Unable to stop recording. Please try again.')
      Alert.alert('Recording error', 'Unable to stop recording. Please try again.')
      setIsRecording(false)
    }
  }

  const transcribeAudio = async (uri) => {
    setTranscribing(true)
    setSpeechError('')
    setTranscript('')

    try {
      const formData = new FormData()
      formData.append('audio', {
        uri,
        name: 'voice.m4a',
        type: 'audio/m4a',
      })

      const response = await fetch(`${API_URL}/api/voice/transcribe`, {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      if (!response.ok) {
        const message = result.message || 'Failed to transcribe audio.'
        throw new Error(message)
      }

      const transcription = result.data?.text || result.data?.transcript || result.text || ''
      if (!transcription) {
        throw new Error('No transcription returned.')
      }

      setTranscript(transcription)
      addMessage('user', transcription)
      await processQuery(transcription)
    } catch (error) {
      console.error('Transcription error:', error)
      setSpeechError(error.message || 'Transcription failed.')
      Alert.alert('Transcription failed', error.message || 'Please try again.')
    } finally {
      setTranscribing(false)
    }
  }

  const handleTextSubmit = () => {
    if (inputText.trim()) {
      addMessage('user', inputText.trim())
      processQuery(inputText.trim())
      setInputText('')
    }
  }

  const addMessage = (type, text) => {
    const newMessage = {
      id: Date.now(),
      type,
      text,
      timestamp: new Date(),
    }
    setMessages(prev => {
      const updated = [...prev, newMessage]
      saveConversationHistory(updated)
      return updated
    })
  }

  const processQuery = async (query) => {
    setThinking(true)
    setSpeechError('')

    try {
      const response = await fetch(`${API_URL}/api/voice/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: query }),
      })

      const result = await response.json()
      if (!response.ok) {
        const message = result.message || 'Failed to generate a response.'
        throw new Error(message)
      }

      const answer = result.data?.text || ''
      if (!answer) {
        throw new Error('OpenAI returned an empty response.')
      }

      addMessage('bot', answer)
      if (ttsEnabled) {
        Speech.speak(answer, { language: 'en' })
      }
    } catch (error) {
      console.error('OpenAI response error:', error)
      const fallback = 'I could not get a response from OpenAI right now. Please try again.'
      setSpeechError(error.message || 'OpenAI response failed.')
      addMessage('bot', fallback)
      if (ttsEnabled) {
        Speech.speak(fallback, { language: 'en' })
      }
    } finally {
      setThinking(false)
    }
  }

  const clearChat = () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear all messages?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            const defaultMessage = [{
              id: 1,
              type: 'bot',
              text: `Hello! I'm your medication assistant for the Kanang-Alalay system. As a ${user?.role?.replace('_', ' ') || 'caregiver'}, you can ask me questions about medications, administration guidelines, or system features.`,
              timestamp: new Date(),
            }]
            setMessages(defaultMessage)
            saveConversationHistory(defaultMessage)
          }
        },
      ]
    )
  }

  const renderMessage = (message) => (
    <View key={message.id} style={[
      styles.messageContainer,
      message.type === 'user' ? styles.userMessage : styles.botMessage
    ]}>
      <View style={[
        styles.messageBubble,
        message.type === 'user' ? styles.userBubble : styles.botBubble
      ]}>
        <Text style={[
          styles.messageText,
          message.type === 'user' ? styles.userText : styles.botText
        ]}>
          {message.text}
        </Text>
      </View>
      <Text style={styles.timestamp}>
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#E45C2B" />
        </TouchableOpacity>
        <Text style={styles.title}>Voice Assistant</Text>
        <TouchableOpacity onPress={clearChat}>
          <Ionicons name="trash-outline" size={24} color="#E45C2B" />
        </TouchableOpacity>
      </View>

      <View style={styles.ttsToggleRow}>
        <Text style={styles.ttsLabel}>{ttsEnabled ? 'TTS: On' : 'TTS: Off'}</Text>
        <Switch
          value={ttsEnabled}
          onValueChange={setTtsEnabled}
          thumbColor={ttsEnabled ? '#E45C2B' : '#f4f3f4'}
          trackColor={{ false: '#767577', true: '#ffc1b8' }}
        />
      </View>

      {/* Chat Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map(renderMessage)}
      </ScrollView>

      {/* Voice Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="Type your question..."
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleTextSubmit}
            returnKeyType="send"
            blurOnSubmit={false}
          />

          <TouchableOpacity
            style={styles.voiceBtn}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <View>
              <Ionicons
                name={isRecording ? 'stop-circle' : 'mic'}
                size={24}
                color="#E45C2B"
              />
            </View>
          </TouchableOpacity>
        </View>

        {speechError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{speechError}</Text>
          </View>
        ) : null}

        {isRecording && (
          <View style={styles.listeningIndicator}>
            <Text style={styles.listeningText}>
              🎤 Recording... Tap the mic again to stop
            </Text>
          </View>
        )}

        {transcribing && (
          <View style={styles.listeningIndicator}>
            <Text style={styles.listeningText}>
              ⏳ Transcribing your audio... please wait
            </Text>
          </View>
        )}

        {thinking && (
          <View style={styles.listeningIndicator}>
            <Text style={styles.listeningText}>
              🤖 Generating OpenAI response... please wait
            </Text>
          </View>
        )}

        {!isRecording && transcript ? (
          <View style={styles.listeningIndicator}>
            <Text style={styles.transcriptText}>
              Recognized: "{transcript}"
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EFEFEF",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: "#fff",
    elevation: 2,
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#7A4A2E",
  },

  chatContainer: {
    flex: 1,
  },

  chatContent: {
    padding: 16,
  },

  messageContainer: {
    marginBottom: 16,
  },

  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
  },

  userMessage: {
    alignSelf: 'flex-end',
  },

  botMessage: {
    alignSelf: 'flex-start',
  },

  userBubble: {
    backgroundColor: '#E45C2B',
    borderBottomRightRadius: 4,
  },

  botBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    elevation: 1,
  },

  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },

  userText: {
    color: '#fff',
  },

  botText: {
    color: '#333',
  },

  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    marginHorizontal: 12,
  },

  inputContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },

  voiceBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E45C2B',
  },

  voiceBtnActive: {
    backgroundColor: '#E45C2B',
  },

  errorContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FDECEA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F5C2C7',
  },

  errorText: {
    color: '#B00020',
    textAlign: 'center',
    fontSize: 14,
  },

  listeningIndicator: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },

  listeningText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },

  transcriptText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },

  ttsToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  ttsLabel: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
})