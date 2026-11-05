import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TrackStackParamList } from "./types";
import TrackHomeScreen from "../screens/TrackHomeScreen";
import SessionScreen from "../screens/SessionScreen";
import SettingsButton from "../components/SettingsButton";
import React from "react";

const Stack = createNativeStackNavigator<TrackStackParamList>();

export default function TrackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TrackHome"
        component={TrackHomeScreen}
        options={{ title: "Track", headerRight: () => <SettingsButton /> }}
      />
      <Stack.Screen
        name="Session"
        component={SessionScreen}
        options={({ route }) => ({ title: route.params.domainName })}
      />
    </Stack.Navigator>
  );
}
