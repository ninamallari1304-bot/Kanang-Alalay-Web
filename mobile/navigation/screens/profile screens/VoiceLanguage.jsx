import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from "react-native";
import React, { useState } from 'react'
import { Ionicons } from "@expo/vector-icons";
import * as Speech from 'expo-speech';

export default function VoiceLanguage({navigation}) {
  const [englishSelected, setEnglishSelected] = useState(true);
  const [filipinoSelected, setFilipinoSelected] = useState(false);
  const [voiceGuidance, setVoiceGuidance] = useState(true);
  const [voiceType, setVoiceType] = useState('female');
  const [speechSpeed, setSpeechSpeed] = useState(1.0);

  const testVoice = () => {
    if (voiceGuidance) {
      Speech.speak("This is a test of the voice guidance feature.", {
        language: englishSelected ? 'en' : 'fil',
        pitch: 1.0,
        rate: speechSpeed,
      });
    }
  };

  const applyChanges = () => {
    // Save settings, perhaps to AsyncStorage
    testVoice();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Main", { screen: "Profile" })}>
          <Ionicons name="arrow-back" size={26} color="#E45C2B" />
        </TouchableOpacity>

        <Text style={styles.title}>Voice & Language</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Language Options */}
        <View style={styles.languageCard}>
          <View style={styles.languageRow}>
            <Text style={styles.languageText}>ENGLISH</Text>
            <Switch
              value={englishSelected}
              onValueChange={(value) => {
                setEnglishSelected(value);
                setFilipinoSelected(!value);
              }}
              trackColor={{ false: "#D1D1D1", true: "#FFD700" }}
              thumbColor={englishSelected ? "#FFA500" : "#f4f3f4"}
            />
          </View>
        </View>

        <View style={styles.languageCard}>
          <View style={styles.languageRow}>
            <Text style={styles.languageText}>FILIPINO</Text>
            <Switch
              value={filipinoSelected}
              onValueChange={(value) => {
                setFilipinoSelected(value);
                setEnglishSelected(!value);
              }}
              trackColor={{ false: "#D1D1D1", true: "#FFD700" }}
              thumbColor={filipinoSelected ? "#FFA500" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Enable Voice Guidance */}
        <View style={styles.languageCard}>
          <View style={styles.languageRow}>
            <Text style={styles.voiceGuidanceText}>Enable Voice Guidance</Text>
            <Switch
              value={voiceGuidance}
              onValueChange={setVoiceGuidance}
              trackColor={{ false: "#D1D1D1", true: "#FFD700" }}
              thumbColor={voiceGuidance ? "#FFA500" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Apply Changes Button */}
        <TouchableOpacity style={styles.applyButton} onPress={applyChanges}>
          <Text style={styles.applyButtonText}>Apply Changes</Text>
        </TouchableOpacity>

        {/* Voice Type */}
        <TouchableOpacity style={styles.optionCard} onPress={() => setVoiceType(voiceType === 'female' ? 'male' : 'female')}>
          <Text style={styles.optionText}>Voice Type: {voiceType === 'female' ? 'Female' : 'Male'}</Text>
        </TouchableOpacity>

        {/* Speech Speed */}
        <View style={styles.optionCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.optionText}>Speech Speed: {speechSpeed.toFixed(1)}x</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => setSpeechSpeed(Math.max(0.5, speechSpeed - 0.1))}>
                <Text style={styles.adjustBtn}>−</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSpeechSpeed(Math.min(2.0, speechSpeed + 0.1))}>
                <Text style={styles.adjustBtn}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EFEFEF",
    paddingTop: 30,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#7A4A2E",
    marginLeft: 12,
  },

  content: {
    flex: 1,
    paddingHorizontal: 16,
  },

  languageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  languageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  languageText: {
    fontSize: 15,
    color: "#7A4A2E",
    fontWeight: "500",
  },

  voiceGuidanceText: {
    fontSize: 15,
    color: "#7A4A2E",
    flex: 1,
  },

  applyButton: {
    backgroundColor: "#E67E50",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  applyButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },

  optionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  optionText: {
    fontSize: 15,
    color: "#333333",
  },

  adjustBtn: {
    fontSize: 24,
    color: "#E67E50",
    marginHorizontal: 12,
    fontWeight: "bold",
  },
});