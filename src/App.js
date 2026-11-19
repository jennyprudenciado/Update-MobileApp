import React, { useState } from "react";
import { Alert, Text } from "react-native";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Data
import { initialPlants, initialDiary } from "./data/plantsdata";

// Constants and styles
import { COLORS } from "./constants/colors";
import { styles } from "./styles/styles";

// Screens
import HomeScreen from "./screens/HomeScreen";
import AddPlant from "./screens/AddPlant";
import Schedule from "./screens/Schedule";
import Diary from "./screens/Diary";

const Tab = createBottomTabNavigator();

export default function App() {
  const [plants, setPlants] = useState(initialPlants);
  const [diary, setDiary] = useState(initialDiary);

  function waterPlant(id) {
    setPlants((currentPlants) =>
      currentPlants.map((plant) =>
        plant.id === id
          ? {
              ...plant,
              lastWatered: new Date(),
            }
          : plant
      )
    );

    Alert.alert(
      "Plant Watered 💧",
      "The watering schedule has been updated."
    );
  }

  function addPlant(plant) {
    setPlants((currentPlants) => [...currentPlants, plant]);
  }

  function addDiary(entry) {
    setDiary((currentDiary) => [entry, ...currentDiary]);
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.muted,

            tabBarStyle: {
              height: 68,
              paddingBottom: 8,
              paddingTop: 8,
              backgroundColor: COLORS.white,
              borderTopColor: COLORS.border,
            },

            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: "600",
            },
          }}
        >
          {/* HOME */}
          <Tab.Screen
            name="Home"
            options={{
              tabBarIcon: () => (
                <Text style={styles.tabIcon}>🏠</Text>
              ),
            }}
          >
            {({ navigation }) => (
              <HomeScreen
                navigation={navigation}
                plants={plants}
                onWaterPlant={waterPlant}
              />
            )}
          </Tab.Screen>

          {/* SCHEDULE */}
          <Tab.Screen
            name="Schedule"
            options={{
              tabBarIcon: () => (
                <Text style={styles.tabIcon}>🗓️</Text>
              ),
            }}
          >
            {() => (
              <Schedule
                plants={plants}
                onWaterPlant={waterPlant}
              />
            )}
          </Tab.Screen>

          {/* DIARY */}
          <Tab.Screen
            name="Diary"
            options={{
              tabBarIcon: () => (
                <Text style={styles.tabIcon}> 📷</Text>
              ),
            }}
          >
            {() => (
              <Diary
                plants={plants}
                diary={diary}
                onAddDiary={addDiary}
              />
            )}
          </Tab.Screen>

          {/* ADD PLANT */}
          <Tab.Screen
            name="Add Plant"
            options={{
              tabBarIcon: () => (
                <Text style={styles.tabIcon}>🌱</Text>
              ),
            }}
          >
            {({ navigation }) => (
              <AddPlant
                navigation={navigation}
                onAddPlant={addPlant}
              />
            )}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}