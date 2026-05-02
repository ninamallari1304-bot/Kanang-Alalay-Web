const path = require("path");
require("dotenv").config();

module.exports = {
  expo: {
    name: "capstoneapp",
    slug: "capstoneapp",
    sdkVersion: "54.0.0",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") || "https://kanang-alalay-backend.onrender.com"
    },
    plugins: [
      [
        "expo-speech-recognition",
        {
          microphonePermission: "Allow $(PRODUCT_NAME) to use the microphone.",
          speechRecognitionPermission: "Allow $(PRODUCT_NAME) to use speech recognition.",
          androidSpeechServicePackages: ["com.google.android.googlequicksearchbox"]
        }
      ]
    ]
  }
};