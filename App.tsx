import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { getDb } from "./src/db/db";
import { seedDomains } from "./src/db/seed";
import { ThemeProvider, useTheme } from "./src/theme/ThemeContext";
import TrackNavigator from "./src/navigation/TrackNavigator";
import HistoryScreen from "./src/screens/HistoryScreen";
import WeekScreen from "./src/screens/WeekScreen";
import HeatmapScreen from "./src/screens/HeatmapScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import SettingsButton from "./src/components/SettingsButton";
import React from "react";
import { AppSettingsProvider } from "./src/settings/AppSettings";
import * as NavigationBar from "expo-navigation-bar";

const Tab = createBottomTabNavigator();
const Root = createNativeStackNavigator();

function MainTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerRight: () => <SettingsButton />,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
      }}
    >
      <Tab.Screen
        name="Track"
        component={TrackNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "timer" : "timer-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "pie-chart" : "pie-chart-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Week"
        component={WeekScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "bar-chart" : "bar-chart-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Heatmap"
        component={HeatmapScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "grid" : "grid-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { resolved, colors } = useTheme();
  const base = resolved === "dark" ? DarkTheme : DefaultTheme;

  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.border,
    },
  };

  useEffect(() => {
    const setNavButtonStyle =
      (NavigationBar as any).setButtonStyleAsync ??
      (NavigationBar as any).setButtonStyle;

    if (typeof setNavButtonStyle === "function") {
      Promise.resolve(
        setNavButtonStyle(resolved === "dark" ? "light" : "dark"),
      ).catch(() => {});
    }
  }, [colors.background, resolved]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={resolved === "dark" ? "light" : "dark"} />
      <NavigationContainer theme={navTheme}>
        <Root.Navigator>
          <Root.Screen
            name="Main"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Root.Screen name="Settings" component={SettingsScreen} />
        </Root.Navigator>
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await getDb();
      await seedDomains();
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppSettingsProvider>
          <AppNavigator />
        </AppSettingsProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
