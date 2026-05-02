import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Animated,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Speech from 'expo-speech-recognition'

export default function VoiceAssistant({ navigation }) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hello! I\'m your medication assistant. Ask me questions like "What medication is best for a coughing woman?" or "How to administer insulin?"',
      timestamp: new Date(),
    }
  ])
  const [inputText, setInputText] = useState('')
  const pulseAnim = useRef(new Animated.Value(1)).current
  const scrollViewRef = useRef()

  useEffect(() => {
    if (isListening) {
      startPulseAnimation()
    } else {
      stopPulseAnimation()
    }
  }, [isListening])

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation()
    pulseAnim.setValue(1)
  }

  const startListening = async () => {
    try {
      const { granted } = await Speech.requestPermissionsAsync()
      if (!granted) {
        Alert.alert('Permission Required', 'Microphone permission is required for voice input.')
        return
      }

      setIsListening(true)
      setTranscript('')

      await Speech.startAsync({
        language: 'en-US',
        onResult: (result) => {
          setTranscript(result.transcript)
          if (result.isFinal) {
            handleVoiceInput(result.transcript)
          }
        },
        onError: (error) => {
          console.error('Speech recognition error:', error)
          setIsListening(false)
          Alert.alert('Error', 'Speech recognition failed. Please try again.')
        }
      })
    } catch (error) {
      console.error('Error starting speech recognition:', error)
      Alert.alert('Error', 'Failed to start voice recognition.')
    }
  }

  const stopListening = async () => {
    try {
      await Speech.stopAsync()
      setIsListening(false)
    } catch (error) {
      console.error('Error stopping speech recognition:', error)
    }
  }

  const handleVoiceInput = (text) => {
    if (text.trim()) {
      addMessage('user', text.trim())
      processQuery(text.trim())
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
    setMessages(prev => [...prev, newMessage])
  }

  const processQuery = (query) => {
    const lowerQuery = query.toLowerCase()

    // Simulate AI processing delay
    setTimeout(() => {
      let response = ''

      // Basic medication queries
      if (lowerQuery.includes('cough') && lowerQuery.includes('woman')) {
        response = 'For a woman with a cough, I recommend:\n\n• Dextromethorphan (Robitussin DM) for dry cough\n• Guaifenesin (Mucinex) for productive cough\n• Honey and lemon tea for natural relief\n\nPlease consult a doctor for proper diagnosis and prescription.'
      } else if (lowerQuery.includes('fever') || lowerQuery.includes('temperature')) {
        response = 'For fever management:\n\n• Acetaminophen (Tylenol) - 500mg every 4-6 hours\n• Ibuprofen (Advil) - 400mg every 6-8 hours\n• Keep hydrated and rest\n\nMonitor temperature and seek medical attention if fever exceeds 103°F (39.4°C).'
      } else if (lowerQuery.includes('pain') || lowerQuery.includes('headache')) {
        response = 'For pain relief:\n\n• Acetaminophen (Tylenol) - 500mg every 4-6 hours\n• Ibuprofen (Advil/Motrin) - 400mg every 6-8 hours\n• Naproxen (Aleve) - 220mg every 8-12 hours\n\nDo not exceed recommended dosage.'
      } else if (lowerQuery.includes('blood pressure') || lowerQuery.includes('hypertension')) {
        response = 'Common blood pressure medications:\n\n• ACE Inhibitors: Lisinopril, Enalapril\n• ARBs: Losartan, Valsartan\n• Beta-blockers: Metoprolol, Atenolol\n• Calcium channel blockers: Amlodipine\n\nAlways take as prescribed and monitor blood pressure regularly.'
      } else if (lowerQuery.includes('diabetes') || lowerQuery.includes('insulin')) {
        response = 'Insulin administration guidelines:\n\n• Check blood sugar before administering\n• Use correct insulin type and dosage\n• Rotate injection sites\n• Store insulin properly (refrigerated)\n• Monitor for signs of hypo/hyperglycemia\n\nConsult healthcare provider for specific instructions.'
      } else if (lowerQuery.includes('antibiotic') || lowerQuery.includes('infection')) {
        response = 'Important antibiotic information:\n\n• Always complete the full course\n• Take at regular intervals\n• Common side effects: nausea, diarrhea\n• Some antibiotics interact with other medications\n• Finish even if symptoms improve\n\nNever share antibiotics or use leftover prescriptions.'
      } else if (lowerQuery.includes('administer') || lowerQuery.includes('give')) {
        response = 'Medication administration best practices:\n\n• Verify patient identity (5 rights)\n• Check medication, dose, route, time\n• Educate patient about medication\n• Monitor for side effects\n• Document administration properly\n• Wash hands before and after'
      } else {
        response = 'I\'m here to help with medication-related questions. You can ask about:\n\n• Specific medication recommendations\n• Administration guidelines\n• Side effects and interactions\n• Storage requirements\n• General health information\n\nPlease consult a healthcare professional for medical advice.'
      }

      addMessage('bot', response)
    }, 1000)
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
          onPress: () => setMessages([messages[0]])
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
            style={[styles.voiceBtn, isListening && styles.voiceBtnActive]}
            onPress={isListening ? stopListening : startListening}
          >
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Ionicons
                name={isListening ? "stop" : "mic"}
                size={24}
                color={isListening ? "#fff" : "#E45C2B"}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {isListening && (
          <View style={styles.listeningIndicator}>
            <Text style={styles.listeningText}>
              🎤 Listening... Say your question
            </Text>
            {transcript && (
              <Text style={styles.transcriptText}>"{transcript}"</Text>
            )}
          </View>
        )}
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
})