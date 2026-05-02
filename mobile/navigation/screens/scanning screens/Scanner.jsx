import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { scanMedication } from '../../../services/api';
import * as Speech from 'expo-speech';
import { Camera, CameraView } from 'expo-camera';

export default function Scanner({ navigation, route }) {
  const nav = useNavigation();
  const [hasPermission, setHasPermission] = useState(false);
  const [isHandlingScan, setIsHandlingScan] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const requestCameraPermission = async () => {
    if (typeof Camera?.requestCameraPermissionsAsync === 'function') {
      return Camera.requestCameraPermissionsAsync();
    }
    if (typeof Camera?.requestPermissionsAsync === 'function') {
      return Camera.requestPermissionsAsync();
    }
    return { granted: false };
  };

  const ensurePermission = async () => {
    if (hasPermission) return true;
    const result = await requestCameraPermission();
    const granted = !!result?.granted;
    setHasPermission(granted);
    return granted;
  };

  const handleScannedData = async ({ data }) => {
    if (isHandlingScan || !data) return;

    setIsHandlingScan(true);
    try {
      const res = await scanMedication(data);
      const med = res.data.data;
      setLastResult({
        medicationName: med.name,
        action: 'removed_from_inventory',
        at: new Date().toISOString(),
      });
      Speech.speak(`Medication ${med.name} scanned and removed from stock.`, { language: 'en' });
    } catch (error) {
      console.error('Error:', error);
      Speech.speak('Error processing medication. Please try again.', { language: 'en' });
    } finally {
      setTimeout(() => setIsHandlingScan(false), 900);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#E45C2B" />
        </TouchableOpacity>
        <Text style={styles.title}>Scan QR Code</Text>
      </View>

      <View style={styles.cameraWrap}>
        {hasPermission ? (
          <CameraView
            style={styles.camera}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={isHandlingScan ? undefined : handleScannedData}
          />
        ) : (
          <View style={styles.cameraPlaceholder}>
            <Ionicons name="camera" size={42} color="#94a3b8" />
            <Text style={styles.cameraPlaceholderText}>Camera permission required</Text>
          </View>
        )}
        <View style={styles.overlayFrame} pointerEvents="none" />
      </View>

      {!hasPermission && (
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={async () => {
            const ok = await ensurePermission();
            if (!ok) {
              Speech.speak('Camera permission is required to scan QR codes.', { language: 'en' });
            }
          }}
        >
          <Text style={styles.permissionButtonText}>Allow Camera Access</Text>
        </TouchableOpacity>
      )}

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>How it works</Text>
        <Text style={styles.infoText}>- Scan QR code on medication packaging.</Text>
        <Text style={styles.infoText}>- System automatically removes one item from inventory.</Text>
        <Text style={styles.infoText}>- Audio confirmation will be provided.</Text>
      </View>

      {lastResult ? (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Last Scan</Text>
          <Text style={styles.resultText}>{lastResult.medicationName}</Text>
          <Text style={styles.resultText}>Removed from inventory</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#B8A88A',
  },
  header: {
    paddingTop: 56,
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: '#E45C2B',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  cameraWrap: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    height: 340,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  cameraPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#020617',
  },
  cameraPlaceholderText: {
    marginTop: 10,
    color: '#cbd5e1',
    fontSize: 13,
  },
  overlayFrame: {
    position: 'absolute',
    left: '20%',
    top: '23%',
    width: '60%',
    height: '54%',
    borderWidth: 2,
    borderColor: '#22c55e',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  permissionButton: {
    marginHorizontal: 16,
    marginTop: -4,
    backgroundColor: '#E45C2B',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: 'white',
    fontWeight: '700',
  },
  infoCard: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoTitle: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  infoText: {
    color: '#d1d5db',
    fontSize: 13,
    marginBottom: 4,
  },
  resultCard: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: '#052e16',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#166534',
  },
  resultTitle: {
    color: '#bbf7d0',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  resultText: {
    color: 'white',
    fontSize: 13,
  },
});