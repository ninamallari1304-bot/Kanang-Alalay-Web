//TEST RUN 
// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';

// import Login from './navigation/screens/Login';

// const Stack = createNativeStackNavigator();

// export default function App() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator>
//         <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthProvider from './contexts/AuthContext';

import Login from './navigation/screens/Login';
import ForgotPass from './navigation/screens/ForgotPass';
import ChangePassword from'./navigation/screens/ChangePassword';

import MainContainer from './navigation/MainContainer';


import TodayScheduleScreen from './navigation/screens/schedule screens/TodayScheduleScreen';
import MyAssignedSchedule from './navigation/screens/schedule screens/MyAssignedSchedule';
import UrgentSchedule from './navigation/screens/schedule screens/UrgentSchedule';

import AboutApp from './navigation/screens/profile screens/AboutApp';
import AccountSettings from './navigation/screens/profile screens/AccountSettings';
import DataSynch from './navigation/screens/profile screens/DataSynch';
import VoiceLanguage from './navigation/screens/profile screens/VoiceLanguage';

import FullInventory from './navigation/screens/inventory screens/FullInventory';
import MedicationStock from './navigation/screens/MedicationStock';
import AllAlerts from './navigation/screens/alert screens/AllAlerts';
import ResidentsStack from './navigation/screens/ResidentsStack';
import ResidentProfile from './navigation/screens/resident screens/ResidentProfile';
import ResidentOverview from './navigation/screens/resident screens/ResidentOverview';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">

          <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
          <Stack.Screen name="ForgotPass" component={ForgotPass} options={{ headerShown: false }} />
          <Stack.Screen name="ChangePassword" component={ChangePassword} options={{ headerShown: false }} />

          <Stack.Screen name="Main" component={MainContainer} options={{ headerShown: false }} />
          <Stack.Screen name="ResidentsStack" component={ResidentsStack} options={{ headerShown: false }} />

          <Stack.Screen name="Schedule" component={TodayScheduleScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AssignedSchedule" component={MyAssignedSchedule} options={{ headerShown: false }} />
          <Stack.Screen name="UrgentSchedule" component={UrgentSchedule} options={{ headerShown: false }} />

          <Stack.Screen name="AboutApp" component={AboutApp} options={{ headerShown: false }} />
          <Stack.Screen name="DataSynch" component={DataSynch} options={{ headerShown: false }} />
          <Stack.Screen name="VoiceLanguage" component={VoiceLanguage} options={{ headerShown: false }} />
          <Stack.Screen name="AccountSettings" component={AccountSettings} options={{ headerShown: false }} />

          <Stack.Screen name="FullInv" component={FullInventory} options={{ headerShown: false }} />
          <Stack.Screen name="StockManagement" component={MedicationStock} options={{ headerShown: false }} />

          <Stack.Screen name="AllAlerts" component={AllAlerts} options={{ headerShown: false }} />
          
          <Stack.Screen name="ResidentProfile" component={ResidentProfile} options={{ headerShown: false }} />
          <Stack.Screen name="ResidentOverview" component={ResidentOverview} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
