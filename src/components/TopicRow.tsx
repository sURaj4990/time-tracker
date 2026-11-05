import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { topicLabel } from "../lib/format";
import { useTheme } from "../theme/ThemeContext";
import { Palette } from "../theme/palettes";

export type TopicRowData = {
  name: string;
  parentName: string | null;
  color: string;
};

export default function TopicRow({
  topic,
  selected = false,
  disabled = false,
  onPress,
}: {
  topic: TopicRowData;
  selected?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.row,
        selected && { borderColor: topic.color, borderWidth: 2 },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: topic.color }]} />
      <Text style={[styles.text, disabled && { opacity: 0.4 }]}>
        {topicLabel(topic)}
      </Text>
    </Pressable>
  );
}

function createStyles(c: Palette) {
  return StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      padding: 14,
      borderRadius: 10,
      backgroundColor: c.surface,
      marginBottom: 8,
    },
    dot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
    text: { fontSize: 16, color: c.text },
  });
}
