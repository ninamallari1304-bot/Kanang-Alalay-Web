import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AllResidents from "./resident screens/AllResidents";
import MyAssignedRes from "./resident screens/MyAssignedRes";
import ByWard from "./resident screens/ByWard";

import MedicationFor from "./scanning screens/MedicationFor";
import ConfirmScan from "./scanning screens/ConfirmScan";
import Scanner from "./scanning screens/Scanner";

import AdministerMedication from "./administer medication/AdministerMedication";
import Delay from "./administer medication/Delay";
import Refuse from "./administer medication/Refuse";
import SideEffect from "./administer medication/SideEffect";
import ConfirmDelay from "./administer medication/ConfirmDelay";
import ConfirmRefuse from "./administer medication/ConfirmRefuse";
import ConfirmSide from "./administer medication/ConfirmSide";
import ResidentProfile from "./resident screens/ResidentProfile";
import ResidentOverview from "./resident screens/ResidentOverview";




const Stack = createNativeStackNavigator();

export default function ResidentsStack() {
  return (
    <Stack.Navigator initialRouteName="AllRes">

      {/* Main Resident Screens */}
      <Stack.Screen name="AllRes" component={AllResidents} options={{ headerShown: false }} />
      <Stack.Screen name="MyAssignRes" component={MyAssignedRes} options={{ headerShown: false }} />
      <Stack.Screen name="ByWard" component={ByWard} options={{ headerShown: false }} />
      <Stack.Screen name="ResidentProfile" component={ResidentProfile} options={{ headerShown: false }} />
      <Stack.Screen name="ResidentOverview" component={ResidentOverview} options={{ headerShown: false }} />

      {/* Medication Flow */}
      <Stack.Screen name="MedicationFor" component={MedicationFor} options={{ headerShown: false }} />
      <Stack.Screen name="ConfirmScan" component={ConfirmScan} options={{ headerShown: false }} />
      <Stack.Screen name="Scanner" component={Scanner} options={{ headerShown: false }} />
      <Stack.Screen name="AdministerMedication" component={AdministerMedication} options={{ headerShown: false }} />
      <Stack.Screen name="Delay" component={Delay} options={{ headerShown: false }} />
      <Stack.Screen name="ConfirmDelay" component={ConfirmDelay} options={{ headerShown: false }} />
      <Stack.Screen name="Refuse" component={Refuse} options={{ headerShown: false }} />
      <Stack.Screen name="ConfirmRefuse" component={ConfirmRefuse} options={{ headerShown: false }} />
      <Stack.Screen name="SideEffect" component={SideEffect} options={{ headerShown: false }} />
      <Stack.Screen name="ConfirmSide" component={ConfirmSide} options={{ headerShown: false }} />

    </Stack.Navigator>
  );
}