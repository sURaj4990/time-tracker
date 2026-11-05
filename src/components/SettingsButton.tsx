import { Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import React from "react";

export default function SettingsButton() {
  const navigation = useNavigation();
  const { colors } = useTheme();

  return (
    <Pressable
      hitSlop={12}
      onPress={() => navigation.navigate("Settings" as never)}
      style={{ marginRight: 14 }}
      accessibilityLabel="Settings"
    >
      <Ionicons name="settings-outline" size={22} color={colors.text} />
    </Pressable>
  );
}
