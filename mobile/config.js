import Constants from "expo-constants";

const fromExtra =
  Constants.expoConfig?.extra?.apiUrl || Constants.manifest?.extra?.apiUrl;
const fromEnv =
  typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL;

const raw = fromExtra || fromEnv || "https://kanang-alalay-backend.onrender.com";

export const API_URL = String(raw).replace(/\/$/, "");