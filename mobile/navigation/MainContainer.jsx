import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

import HomeScreen from './screens/HomeScreen';
import InventoryScreen from './screens/InventoryScreen';
import ProfileScreen from './screens/ProfileScreen';
import ResidentsStack from './screens/ResidentsStack';
import Scanner from './screens/scanning screens/Scanner'

const Tab = createBottomTabNavigator();

// ── Custom Tab Bar ──────────────────────────────────────────────────────────
function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.tabBarWrapper}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const isCenter = route.name === 'Scanner';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Icon mapping
          let iconName;
          if (route.name === 'Home') iconName = isFocused ? 'home' : 'home-outline';
          else if (route.name === 'Residents') iconName = isFocused ? 'people' : 'people-outline';
          else if (route.name === 'Scanner') iconName = 'scan';
          else if (route.name === 'Inventory') iconName = isFocused ? 'cube' : 'cube-outline';
          else if (route.name === 'Profile') iconName = isFocused ? 'person' : 'person-outline';

          // Center floating button
          if (isCenter) {
            return (
              <View key={route.key} style={styles.centerWrapper}>
                <TouchableOpacity
                  style={[styles.centerBtn, isFocused && styles.centerBtnActive]}
                  onPress={onPress}
                  activeOpacity={0.85}
                >
                  <Ionicons name={iconName} size={26} color="#FFF" />
                </TouchableOpacity>
              </View>
            );
          }

          // Regular tab
          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tabItem}
              onPress={onPress}
              activeOpacity={0.7}
            >
              <Ionicons
                name={iconName}
                size={22}
                color={isFocused ? '#C97020' : '#AAA'}
              />
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                {route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ── Main Container ──────────────────────────────────────────────────────────
export default function MainContainer() {

  const getTabBarVisibility = (route) => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? 'AllRes';

    const hiddenScreens = [
      'MedicationFor',
      'ConfirmScan',
      'Scanner',
      'AdministerMedication',
      'Delay',
      'ConfirmDelay',
      'Refuse',
      'ConfirmRefuse',
      'SideEffect',
      'ConfirmSide',
    ];

    return hiddenScreens.includes(routeName);
  };

  return (
    <Tab.Navigator
      tabBar={(props) => {
        // Hide tab bar on certain nested screens
        const currentRoute = props.state.routes[props.state.index];
        const hidden = getTabBarVisibility(currentRoute);
        if (hidden) return null;
        return <CustomTabBar {...props} />;
      }}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Residents" component={ResidentsStack} />
      <Tab.Screen name="Scanner" component={Scanner} />
      <Tab.Screen name="Inventory" component={InventoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 16,       // safe area buffer; swap with useSafeAreaInsets if needed
    backgroundColor: 'transparent',
    pointerEvents: 'box-none',
  },

  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 32,
    marginHorizontal: 16,
    paddingHorizontal: 8,
    height: 62,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    // Leave room for the center button that floats above
    overflow: 'visible',
  },

  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },

  tabLabel: {
    fontSize: 10,
    color: '#AAA',
    fontWeight: '500',
  },

  tabLabelActive: {
    color: '#C97020',
    fontWeight: '600',
  },

  // Center floating button slot
  centerWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // Allow the button to overflow above the tab bar
    overflow: 'visible',
  },

  centerBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#C97020',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,          // lifts it above the bar
    elevation: 6,
    shadowColor: '#C97020',
    shadowOpacity: 0.45,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },

  centerBtnActive: {
    backgroundColor: '#A85A10',
  },
});